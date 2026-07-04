// app/api/ai/conversations/[conversationId]/stream/route.ts
// GET — Stream AI assistant response for a conversation
// Uses Bedrock model to generate and stream the response

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runBedrockModel, resolveModelAlias, type BedrockMessage } from "@/lib/ai/bedrock"
import { CHAT_SYSTEM } from "@/lib/ai/prompts"
import { deductCredits, addCredits } from "@/lib/credits/credit-service"

const MAX_CHAT_HISTORY = parseInt(
  process.env.AI_MAX_CHAT_HISTORY_MESSAGES || "12",
  10
)
const CREDIT_COST = 1

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const messageId = req.nextUrl.searchParams.get("messageId")

  let aiEventId: string | null = null
  let userId: string | null = null
  const startTime = Date.now()

  try {
    const supabase = await createClient()

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id

    // 2. Verify conversation ownership
    const { data: conversation, error: convError } = await supabase
      .from("ai_conversations")
      .select("id, resume_id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // 3. Get the latest model from the user message (if provided)
    let model = "nano_2_5"
    if (messageId) {
      const { data: userMsg } = await supabase
        .from("ai_messages")
        .select("model")
        .eq("id", messageId)
        .single()

      if (userMsg?.model) {
        model = userMsg.model
      }
    }

    // 4. Build resume context if linked
    let resumeContext = ""
    if (conversation.resume_id) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("id, resume_json, title")
        .eq("id", conversation.resume_id)
        .eq("user_id", user.id)
        .single()

      if (resume?.resume_json) {
        resumeContext = `\n\nThe user's resume "${resume.title}" contains the following data:\n${JSON.stringify(resume.resume_json, null, 2).slice(0, 4000)}`
      }
    }

    // 5. Load conversation history
    const { data: historyMessages } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: true })
      .limit(MAX_CHAT_HISTORY)

    const chatHistory: BedrockMessage[] = (historyMessages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    if (chatHistory.length === 0) {
      return NextResponse.json(
        { error: "No messages in conversation" },
        { status: 400 }
      )
    }

    // 6. Deduct credits
    let newBalance: number
    try {
      const result = await deductCredits(
        user.id,
        "ai_resume_chat",
        "ai_event",
        undefined,
        undefined
      )
      newBalance = result.new_balance
    } catch (error) {
      const msg = error instanceof Error ? error.message : "unknown"
      if (msg.includes("insufficient_credits")) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 402 }
        )
      }
      throw error
    }

    // 7. Create ai_event
    const { data: aiEvent } = await supabase
      .from("ai_events")
      .insert({
        user_id: user.id,
        resume_id: conversation.resume_id || null,
        provider: "bedrock",
        model,
        feature: "resume_chat",
        credits_used: CREDIT_COST,
        status: "pending",
        cached: false,
      })
      .select("id")
      .single()

    if (aiEvent) {
      aiEventId = aiEvent.id
    }

    // 8. Call Bedrock
    const modelId = resolveModelAlias(model)
    const systemPrompt = CHAT_SYSTEM + resumeContext

    const aiResponse = await runBedrockModel({
      modelId,
      system: systemPrompt,
      messages: chatHistory,
      maxTokens: 2048,
    })

    // 9. Save assistant message to database
    await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: aiResponse,
        model,
        provider: "bedrock",
        credits_used: CREDIT_COST,
      })

    // 10. Mark ai_event as completed
    const latencyMs = Date.now() - startTime
    if (aiEventId) {
      await supabase
        .from("ai_events")
        .update({
          status: "completed",
          latency_ms: latencyMs,
        })
        .eq("id", aiEventId)
    }

    // 11. Stream the response as text chunks
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks for a streaming effect
        const chunkSize = 8
        let offset = 0

        function pushChunk() {
          if (offset >= aiResponse.length) {
            controller.close()
            return
          }

          const end = Math.min(offset + chunkSize, aiResponse.length)
          const chunk = aiResponse.slice(offset, end)
          controller.enqueue(encoder.encode(chunk))
          offset = end

          // Small delay between chunks for streaming effect
          setTimeout(pushChunk, 10)
        }

        pushChunk()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error(
      "[ai/conversations/stream] Error:",
      error instanceof Error ? error.message : error
    )

    // Refund credits on failure
    if (userId && aiEventId) {
      try {
        const supabase = await createClient()
        await supabase
          .from("ai_events")
          .update({ status: "failed", error_message: "Model call failed" })
          .eq("id", aiEventId)

        await addCredits(
          userId,
          CREDIT_COST,
          "ai_refund",
          "ai_event",
          aiEventId
        )
      } catch (refundErr) {
        console.error("[ai/conversations/stream] Refund error:", refundErr)
      }
    }

    return NextResponse.json(
      { error: "AI is temporarily unavailable. Your credits were refunded." },
      { status: 500 }
    )
  }
}
