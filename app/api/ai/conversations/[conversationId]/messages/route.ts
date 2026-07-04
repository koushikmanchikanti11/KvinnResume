// app/api/ai/conversations/[conversationId]/messages/route.ts
// GET  — Load all messages for a conversation
// POST — Send a new user message (creates conversation if conversationId is "new")

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// ── Schemas ───────────────────────────────────────────────

const SendMessageSchema = z.object({
  content: z.string().min(1).max(12000),
  model: z.enum(["nano_2_5", "nano_3"]).optional().default("nano_2_5"),
  resumeId: z.string().uuid().nullable().optional(),
})

// ── GET: Load messages ────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify conversation ownership
    const { data: conversation, error: convError } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Fetch messages ordered by created_at ascending
    const { data: messages, error: messagesError } = await supabase
      .from("ai_messages")
      .select("id, role, content, model, provider, input_tokens, output_tokens, credits_used, metadata, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("[ai/conversations/messages] GET error:", messagesError.message)
      return NextResponse.json(
        { error: "Failed to load messages" },
        { status: 500 }
      )
    }

    // Map to the shape the client expects
    const formatted = (messages ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
      model: m.model,
      provider: m.provider,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("[ai/conversations/messages] GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ── POST: Send user message ───────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate request body
    const body = await req.json()
    const parsed = SendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { content, model, resumeId } = parsed.data

    // Check credits
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.credits_balance ?? 0) < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      )
    }

    let actualConversationId = conversationId
    let newConversation = null

    // Create a new conversation if conversationId is "new"
    if (conversationId === "new") {
      const title = content.trim().length > 60
        ? content.trim().slice(0, 60)
        : content.trim() || "New conversation"

      const { data: created, error: createError } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          resume_id: resumeId ?? null,
          title,
        })
        .select("id, title, last_message, updated_at, resume_id, created_at")
        .single()

      if (createError || !created) {
        console.error("[ai/conversations/messages] Create conversation error:", createError?.message)
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        )
      }

      actualConversationId = created.id

      newConversation = {
        id: created.id,
        title: created.title,
        lastMessage: content.trim().length > 80
          ? `${content.trim().slice(0, 80)}…`
          : content.trim(),
        updatedAt: created.updated_at,
        resumeId: created.resume_id,
        messageCount: 1,
      }
    } else {
      // Verify conversation ownership
      const { data: existing, error: existError } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single()

      if (existError || !existing) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        )
      }
    }

    // Insert user message
    const { data: userMessage, error: msgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: actualConversationId,
        user_id: user.id,
        role: "user",
        content,
        model: model ?? null,
      })
      .select("id")
      .single()

    if (msgError || !userMessage) {
      console.error("[ai/conversations/messages] Insert message error:", msgError?.message)
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversationId: actualConversationId,
      userMessageId: userMessage.id,
      conversation: newConversation,
    })
  } catch (error) {
    console.error("[ai/conversations/messages] POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
