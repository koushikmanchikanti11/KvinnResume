import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { hasEnoughCredits } from "@/lib/credits/plan-checker"
import { deductCredits, addCredits } from "@/lib/credits/credit-service"
import { runQwen3, BedrockMessage } from "@/lib/ai/bedrock"
import { ENHANCE_BULLET } from "@/lib/ai/prompts"

const Cost = 2 // ai_generate_bullets

const RequestSchema = z.object({
  resumeId: z.string().uuid().optional(),
  role: z.string().optional(),
  rawBullet: z.string().optional(),
  context: z.string().optional(),
  targetRole: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let aiEventId: string | null = null
  let userId: string | null = null
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userId = user.id

    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error }, { status: 400 })
    }

    const { resumeId, role, rawBullet, context, targetRole } = parsed.data

    if (!rawBullet && !context) {
      return NextResponse.json({ error: "No bullet or context provided" }, { status: 400 })
    }

    if (resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single()

      if (resumeError || !resume) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    const { allowed } = await hasEnoughCredits(user.id, Cost)
    if (!allowed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    await deductCredits(user.id, "ai_generate_bullets")

    const { data: aiEvent } = await supabase
      .from("ai_events")
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        provider: "bedrock",
        model: "nano_3",
        feature: "generate_bullets",
        credits_used: Cost,
        status: "pending",
        cached: false,
      })
      .select("id")
      .single()

    if (aiEvent) aiEventId = aiEvent.id

    const userMessage = `
Bullet: ${rawBullet || ""}
Context: ${context || ""}
Role: ${role || ""}
Target Role: ${targetRole || ""}
`

    const messages: BedrockMessage[] = [{ role: "user", content: userMessage }]
    
    const responseText = await runQwen3(ENHANCE_BULLET, messages, 1000)
    
    // Parse JSON safely
    let suggestion
    try {
      // Find JSON block in case model outputs markdown
      const jsonStr = responseText.replace(/```json|```/g, "").trim()
      suggestion = JSON.parse(jsonStr)
    } catch (e) {
       throw new Error("Model failed to output valid JSON")
    }

    if (aiEventId) {
      await supabase
        .from("ai_events")
        .update({ status: "completed", latency_ms: Date.now() - startTime })
        .eq("id", aiEventId)
    }

    return NextResponse.json({ suggestion })

  } catch (error: unknown) {
    console.error("[ai/bullet] Error:", error)
    if (userId && aiEventId) {
      try {
        const supabase = await createClient()
        await supabase.from("ai_events").update({ status: "failed", error_message: "Model failure" }).eq("id", aiEventId)
        await addCredits(userId, Cost, "ai_refund", "ai_event", aiEventId)
      } catch (e) {
        console.error("Refund failed:", e)
      }
    }
    return NextResponse.json({ error: "Failed to generate bullet. Credits refunded." }, { status: 500 })
  }
}