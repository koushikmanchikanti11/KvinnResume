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
      .select("id, status, quality_score, pages_count, provider, created_at, metadata, parsed_json, raw_markdown, raw_text, parsed_items, error_message")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Trigger finalization if completed but not yet structured
    if (
      (job.status === "running" || job.status === "completed") &&
      (!job.raw_markdown || !job.parsed_json)
    ) {
      await finalizeParseJob(jobId);


      // Re-fetch job data after finalization
      const { data: refreshedJob } = await supabase
        .from("parse_jobs")
        .select("id, status, quality_score, pages_count, provider, created_at, metadata, parsed_json, raw_markdown, raw_text, parsed_items, error_message")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single();

      if (refreshedJob) job = refreshedJob;
    }


    // Extract resumeId from metadata
    let resumeId: string | null = null;
    if (job.metadata && typeof job.metadata === "object" && "resume_id" in job.metadata) {
      resumeId = (job.metadata as Record<string, unknown>).resume_id as string;
    }

    // Determine response based on status
    const isCompleted = job.status === "completed";
    const hasResumeId = Boolean(resumeId);
    const hasParsedJson = Boolean(job.parsed_json);
    const isStructureFailed = job.status === "failed";

    // Success case: parsed_json exists + resumeId exists
    if (isCompleted && hasResumeId && hasParsedJson) {
      return NextResponse.json({
        success: true,
        status: "completed",
        jobId: job.id,
        resumeId,
        redirectTo: `/editor/${resumeId}`,
        quality_score: job.quality_score,
        pages_count: job.pages_count,
        provider: job.provider,
        created_at: job.created_at,
      }, { status: 200 });
    }

    // Structure failed case
    if (isStructureFailed) {
      return NextResponse.json({
        success: false,
        status: "failed",
        jobId: job.id,
        message: job.error_message || "Parse failed. Please retry.",
        has_raw_markdown: Boolean(job.raw_markdown),
        has_raw_text: Boolean(job.raw_text),
        quality_score: job.quality_score,
        pages_count: job.pages_count,
        provider: job.provider,
        created_at: job.created_at,
      }, { status: 200 });
    }

    // Still in progress or other states
    return NextResponse.json({
      success: false,
      status: job.status,
      jobId: job.id,
      resumeId: null,
      quality_score: job.quality_score,
      pages_count: job.pages_count,
      provider: job.provider,
      created_at: job.created_at,
      has_raw_markdown: Boolean(job.raw_markdown),
      has_raw_text: Boolean(job.raw_text),
      has_parsed_items: Boolean(job.parsed_items),
      has_parsed_json: Boolean(job.parsed_json),
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("Parse result error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
