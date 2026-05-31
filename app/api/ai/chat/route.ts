// app/api/ai/chat/route.ts — AI Chat streaming route
// Cost: 1 credit per user message
// Auth: Required
// Streaming response via ReadableStream

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { runBedrockModel, resolveModelAlias, type BedrockMessage } from "@/lib/ai/bedrock"
import { CHAT_SYSTEM } from "@/lib/ai/prompts"
import { deductCredits, addCredits } from "@/lib/credits/credit-service"
import { hasEnoughCredits } from "@/lib/credits/plan-checker"
import type { AIModelAlias } from "@/types/ai"

const MAX_CHAT_HISTORY = parseInt(
  process.env.AI_MAX_CHAT_HISTORY_MESSAGES || "12",
  10
)
const MAX_INPUT_CHARS = parseInt(process.env.AI_MAX_INPUT_CHARS || "12000", 10)
const CREDIT_COST = 1

const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_INPUT_CHARS),
      })
    )
    .min(1)
    .max(MAX_CHAT_HISTORY),
  model: z.enum(["nano_25", "nano_3"]),
  resumeId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  let aiEventId: string | null = null
  let userId: string | null = null
  const startTime = Date.now()

  try {
    // 1. Auth check
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id

    // 2. Validate request body
    const body = await req.json()
    const parsed = ChatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request.",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      )
    }

    const { messages, model, resumeId } = parsed.data

    // 3. If resumeId exists, validate ownership
    let resumeContext = ""
    if (resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("id, resume_json, title")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single()

      if (resumeError || !resume) {
        return NextResponse.json(
          { error: "You do not have access to this resume." },
          { status: 403 }
        )
      }

      // Build context from resume
      if (resume.resume_json) {
        resumeContext = `\n\nThe user's resume "${resume.title}" contains the following data:\n${JSON.stringify(resume.resume_json, null, 2).slice(0, 4000)}`
      }
    }

    // 4. Check credits
    const { allowed, balance } = await hasEnoughCredits(user.id, CREDIT_COST)
    if (!allowed) {
      return NextResponse.json(
        { error: "Insufficient credits." },
        { status: 402 }
      )
    }

    // 5. Deduct credits before model call
    const { new_balance } = await deductCredits(
      user.id,
      "ai_resume_chat",
      "ai_event",
      undefined,
      undefined
    )

    // 6. Create ai_event
    const { data: aiEvent } = await supabase
      .from("ai_events")
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        provider: "bedrock",
        model: model,
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

    // 7. Resolve model alias to internal model ID
    const modelId = resolveModelAlias(model)

    // 8. Build system prompt with resume context
    const systemPrompt = CHAT_SYSTEM + resumeContext

    // 9. Limit chat history
    const limitedMessages = messages.slice(-MAX_CHAT_HISTORY)

    // 10. Call Bedrock (non-streaming for reliability)
    const bedrockMessages: BedrockMessage[] = limitedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const aiResponse = await runBedrockModel({
      modelId,
      system: systemPrompt,
      messages: bedrockMessages,
      maxTokens: 2048,
    })

    // 11. Mark ai_event as completed
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

    // 12. Return response
    return NextResponse.json({
      content: aiResponse,
      model: model as AIModelAlias,
      credits_remaining: new_balance,
    })
  } catch (error: unknown) {
    console.error("[ai/chat] Error:", error instanceof Error ? error.message : error)

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
        console.error("[ai/chat] Refund error:", refundErr)
      }
    }

    return NextResponse.json(
      { error: "AI is temporarily unavailable. Your credits were refunded." },
      { status: 500 }
    )
  }
}
