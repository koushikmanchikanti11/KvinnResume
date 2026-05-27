import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkParseJob } from "@/lib/parsers/parser-router";
import { redis } from "@/lib/redis/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fast path — check Redis first
    const cachedStatus = await redis.get(`job:parse:${jobId}:status`);
    const cachedOwner = await redis.get(`job:parse:${jobId}:owner`);

    if (cachedStatus) {
      // Ownership check on cached path
      if (cachedOwner && cachedOwner !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      // Terminal statuses — return immediately, no DB or provider needed
      if (["completed", "failed", "cancelled"].includes(cachedStatus as string)) {
        return NextResponse.json({ jobId, status: cachedStatus }, { status: 200 });
      }
      // Non-terminal — fall through to provider check below
    }

    // 1. Read local DB
    const { data: job, error: jobError } = await supabase
      .from("parse_jobs")
      .select("status, error_message, quality_score, pages_count")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Store owner in Redis if missing (for cache misses)
    if (!cachedOwner) {
      await redis.set(`job:parse:${jobId}:owner`, user.id, { ex: 3600 });
    }

    // 2. If terminal, return immediately
    if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
      return NextResponse.json({
        jobId,
        status: job.status,
        error: job.error_message,
        quality_score: job.quality_score,
        pages_count: job.pages_count,
      }, { status: 200 });
    }

    // 3. Otherwise actively poll the provider
    const currentStatus = await checkParseJob(jobId);

    // Return the updated status, using the originally fetched error/quality/pages data
    // since those don't typically change during the polling phase until completion
    return NextResponse.json({
      jobId,
      status: currentStatus,
      error: job.error_message || null,
      quality_score: job.quality_score || 0,
      pages_count: job.pages_count || null,
    }, { status: 200 });

  } catch (err: any) {
    console.error("Parse status error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
