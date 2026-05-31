import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { hasEnoughCredits } from "@/lib/credits/plan-checker"
import { deductCredits, addCredits } from "@/lib/credits/credit-service"
import { runMinimax25, BedrockMessage } from "@/lib/ai/bedrock"
import { ATS_ANALYZE } from "@/lib/ai/prompts"

const Cost = 3 // ai_ats_optimization

const RequestSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().optional(),
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

    const { resumeId, jobDescription } = parsed.data

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

    await deductCredits(user.id, "ai_ats_optimization")

    const { data: aiEvent } = await supabase
      .from("ai_events")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        provider: "bedrock",
        model: "nano_25",
        feature: "ats_optimization",
        credits_used: Cost,
        status: "pending",
        cached: false,
      })
      .select("id")
      .single()

    if (aiEvent) aiEventId = aiEvent.id

    const userMessage = `
Resume JSON:
${JSON.stringify(resume.resume_json, null, 2).slice(0, 6000)}

Job Description:
${jobDescription || "None provided"}
`

    const messages: BedrockMessage[] = [{ role: "user", content: userMessage }]
    
    const responseText = await runMinimax25(ATS_ANALYZE, messages, 2000)
    
    // Parse JSON safely
    let atsResult
    try {
      const jsonStr = responseText.replace(/```json|```/g, "").trim()
      atsResult = JSON.parse(jsonStr)
    } catch (e) {
       throw new Error("Model failed to output valid JSON")
    }

    if (aiEventId) {
      await supabase
        .from("ai_events")
        .update({ status: "completed", latency_ms: Date.now() - startTime })
        .eq("id", aiEventId)
    }

    return NextResponse.json({ 
      score: atsResult.score || 0,
      diagnostics: atsResult.diagnostics || [] 
    })

  } catch (error: unknown) {
    console.error("[ai/ats] Error:", error)
    if (userId && aiEventId) {
      try {
        const supabase = await createClient()
        await supabase.from("ai_events").update({ status: "failed", error_message: "Model failure" }).eq("id", aiEventId)
        await addCredits(userId, Cost, "ai_refund", "ai_event", aiEventId)
      } catch (e) {
        console.error("Refund failed:", e)
      }
    }
    return NextResponse.json({ error: "Failed to run ATS analysis. Credits refunded." }, { status: 500 })
  }
}
