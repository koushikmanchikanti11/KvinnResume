import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { hasEnoughCredits, getPlanLimits } from "@/lib/credits/plan-checker"
import { deductCredits, addCredits } from "@/lib/credits/credit-service"
import { runMinimax25, BedrockMessage } from "@/lib/ai/bedrock"
import { COVER_LETTER_PROMPT } from "@/lib/ai/prompts"

const Cost = 5 // ai_cover_letter

const RequestSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string(),
  company: z.string(),
  tone: z.string().optional(),
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

    const { resumeId, jobDescription, company, tone } = parsed.data

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const limits = await getPlanLimits(profile.plan)
    if (limits && !limits.cover_letter_enabled) {
      return NextResponse.json({ error: "This feature is available on Pro and Premium plans." }, { status: 403 })
    } else if (!limits && profile.plan === 'free') {
       return NextResponse.json({ error: "This feature is available on Pro and Premium plans." }, { status: 403 })
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, resume_json")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { allowed } = await hasEnoughCredits(user.id, Cost)
    if (!allowed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    const { new_balance } = await deductCredits(user.id, "ai_cover_letter")

    const { data: aiEvent } = await supabase
      .from("ai_events")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        provider: "bedrock",
        model: "nano_25",
        feature: "cover_letter",
        credits_used: Cost,
        status: "pending",
        cached: false,
      })
      .select("id")
      .single()

    if (aiEvent) aiEventId = aiEvent.id

    const userMessage = `
Company: ${company}
Job Description: ${jobDescription}
Tone: ${tone || "Professional"}
Resume Context:
${JSON.stringify(resume.resume_json, null, 2).slice(0, 6000)}
`

    const messages: BedrockMessage[] = [{ role: "user", content: userMessage }]
    
    const responseText = await runMinimax25(COVER_LETTER_PROMPT, messages, 2000)

    if (aiEventId) {
      await supabase
        .from("ai_events")
        .update({ status: "completed", latency_ms: Date.now() - startTime })
        .eq("id", aiEventId)
    }

    return NextResponse.json({ coverLetter: responseText.trim(), credits_remaining: new_balance })

  } catch (error: unknown) {
    console.error("[ai/cover-letter] Error:", error)
    if (userId && aiEventId) {
      try {
        const supabase = await createClient()
        await supabase.from("ai_events").update({ status: "failed", error_message: "Model failure" }).eq("id", aiEventId)
        await addCredits(userId, Cost, "ai_refund", "ai_event", aiEventId)
      } catch (e) {
        console.error("Refund failed:", e)
      }
    }
    return NextResponse.json({ error: "Failed to generate cover letter. Credits refunded." }, { status: 500 })
  }
}