import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finalizeParseJob } from "@/lib/parsers/parser-router";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let { data: job, error: jobError } = await supabase
      .from("parse_jobs")
      .select("id, status, quality_score, pages_count, provider, created_at, metadata, parsed_json")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Trigger finalization if completed but not yet structured
    if (job.status === "completed" && !job.parsed_json) {
      await finalizeParseJob(jobId);
      
      // Re-fetch job data after finalization
      const { data: refreshedJob } = await supabase
        .from("parse_jobs")
        .select("id, status, quality_score, pages_count, provider, created_at, metadata, parsed_json")
        .eq("id", jobId)
        .single();
        
      if (refreshedJob) job = refreshedJob;
    }

    let resumeId = null;
    if (job.metadata && typeof job.metadata === "object" && "resume_id" in job.metadata) {
       resumeId = (job.metadata as any).resume_id;
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      resumeId: resumeId,
      quality_score: job.quality_score,
      pages_count: job.pages_count,
      provider: job.provider,
      created_at: job.created_at,
    }, { status: 200 });

  } catch (err: any) {
    console.error("Parse result error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
