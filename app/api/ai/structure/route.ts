import { NextRequest, NextResponse } from "next/server"
import { structureResumeFromJob } from "@/lib/ai/resume-ai"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const secret = process.env.INTERNAL_API_SECRET

    if (!secret || authHeader !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    const result = await structureResumeFromJob(jobId)

    return NextResponse.json({ success: true, resumeId: result.resumeId })
  } catch (error) {
    console.error("[ai/structure] Internal Error:", error)
    return NextResponse.json(
      { success: false, error: "AI structuring failed." },
      { status: 500 }
    )
  }
}
