import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import { startLlamaParseJob, getLlamaParseJob } from "./llamaparse";
import { startReductoJob, getReductoJob } from "./reducto";
import { redis } from "@/lib/redis/client";
import { structureResumeFromJob } from "@/lib/ai/resume-ai";
import { ParseMode, ParseStatus, ParseProvider, NormalizedParseResult } from "@/types/parser";
import { normalizeLlamaParseStatus, normalizeReductoStatus } from "./normalize-status";
import { normalizeLlamaParseResult, normalizeReductoResult } from "./normalize-result";

// 1. Start job (fast HTTP call, no polling)
export async function startParseJob(mode: ParseMode, jobId: string) {
  try {
    const supabase = await createClient();

    // Get job and file details
    const { data: job, error: jobError } = await supabase
      .from("parse_jobs")
      .select("*, resume_files(storage_path)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Parse job ${jobId} not found`);
    }

    // @ts-ignore - Supabase join typing issue
    const storagePath = job.resume_files?.storage_path;
    if (!storagePath) {
      throw new Error("Storage path not found");
    }

    const fileUrl = await getSignedUrl(supabase, "resume-originals", storagePath, 3600);

    let externalJobId = "";
    let provider: ParseProvider = "llamaparse";

    if (mode === "nano" || mode === "nano_mini" || mode === "auto") {
      const tier = mode === "nano_mini" ? "agentic" : "cost_effective";
      const { job_id } = await startLlamaParseJob(fileUrl, tier);
      externalJobId = job_id;
      provider = "llamaparse";
    } else if (mode === "nano_pro") {
      const { job_id } = await startReductoJob(fileUrl, { jobId });
      externalJobId = job_id;
      provider = "reducto";
    }

    // Save provider and external job ID to DB and Redis
    await supabase.from("parse_jobs").update({
      external_job_id: externalJobId,
      provider,
      status: "running"
    }).eq("id", jobId);

    await redis.set(`job:parse:${jobId}:status`, "running", { ex: 3600 });
  } catch (err: any) {
    console.error(`Error starting parse job ${jobId}:`, err);
    await failJob(jobId, err.message);
    throw err; // Re-throw to signal failure to caller
  }
}

// 2. Check status (called by GET /api/parse/status polling)
export async function checkParseJob(jobId: string): Promise<ParseStatus> {
  const supabase = await createClient();
  const { data: job } = await supabase.from("parse_jobs").select("*, resume_files(storage_path)").eq("id", jobId).single();

  if (!job) return "failed";
  if (job.status === "cancelled" || job.status === "completed" || job.status === "failed") {
    return job.status as ParseStatus;
  }

  if (!job.external_job_id) return "pending";

  try {
    let normalizedStatus: ParseStatus = "pending";
    let providerStatusResponse: any = null;

    if (job.provider === "llamaparse") {
      providerStatusResponse = await getLlamaParseJob(job.external_job_id);
      normalizedStatus = normalizeLlamaParseStatus(providerStatusResponse.status);
    } else if (job.provider === "reducto") {
      providerStatusResponse = await getReductoJob(job.external_job_id);
      normalizedStatus = normalizeReductoStatus(providerStatusResponse.status);
    }

    // Auto Fallback Heuristics
    if (job.parser_mode === "auto" && job.provider === "llamaparse" && normalizedStatus === "completed") {
      const parsedData = normalizeLlamaParseResult(providerStatusResponse.data);
      if (shouldFallbackToReducto(parsedData)) {
        console.log(`Auto mode fallback triggered for job ${jobId}`);

        // Start Reducto job
        // @ts-ignore
        const storagePath = job.resume_files?.storage_path;
        const fileUrl = await getSignedUrl(supabase, "resume-originals", storagePath, 3600);

        const { job_id: fallbackId } = await startReductoJob(fileUrl, { jobId });

        await supabase.from("parse_jobs").update({
          external_job_id: fallbackId,
          provider: "reducto",
          status: "running"
        }).eq("id", jobId);

        await redis.set(`job:parse:${jobId}:status`, "running", { ex: 3600 });
        return "running";
      }
    }

    // When provider says completed, keep local status as "running"
    // because finalizeParseJob + AI structuring still needs to run.
    // The status route will trigger finalization, which sets "completed" after structuring.
    if (normalizedStatus === "completed") {
      // Don't update DB to "completed" yet — finalize will do that after structuring
      return "completed"; // Signal to status route that finalization can proceed
    }

    if (normalizedStatus !== job.status) {
      await supabase.from("parse_jobs").update({ status: normalizedStatus }).eq("id", jobId);
      await redis.set(`job:parse:${jobId}:status`, normalizedStatus, { ex: 3600 });
    }

    return normalizedStatus;
  } catch (err: any) {
    console.error(`Error checking status for job ${jobId}:`, err);
    return "running"; // Default to running on transient network error, wait for next poll
  }
}

// 3. Finalize Job (called once when provider reports completed, before AI structuring)
export async function finalizeParseJob(jobId: string) {
  // Race guard — prevent double-execution from concurrent requests
  const finalizeKey = `lock:finalize:${jobId}`;
  const guard = await redis.setnx(finalizeKey, "1");
  if (!guard) return; // already running or done
  await redis.expire(finalizeKey, 120); // 2 min TTL

  const supabase = await createClient();
  const { data: job } = await supabase.from("parse_jobs").select("*").eq("id", jobId).single();

  if (!job || !job.external_job_id) throw new Error("Job not ready to finalize");
  if (job.parsed_json) return; // Already finalized

  try {
    let result: NormalizedParseResult;

    if (job.provider === "llamaparse") {
      const res = await getLlamaParseJob(job.external_job_id);
      result = normalizeLlamaParseResult(res.data);
    } else {
      const res = await getReductoJob(job.external_job_id);
      result = await normalizeReductoResult(res.data);
    }

    // Save raw parsed data — status stays "running" while AI structuring happens
    const currentMetadata = (job.metadata as Record<string, any>) || {};
    currentMetadata.pages_count = result.pages_count;

    await supabase.from("parse_jobs").update({
      status: "running",
      raw_markdown: result.raw_markdown,
      raw_text: result.raw_text,
      parsed_items: result.parsed_items,
      pages_count: result.pages_count,
      metadata: {
        ...currentMetadata,
        ...result.metadata,
        pages_count: result.pages_count,
      },
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);

    await redis.set(`job:parse:${jobId}:status`, "running", { ex: 3600 });

    // Trigger AI Structuring — this sets status to "completed" when done
    //await structureResumeFromJob(jobId);
    // TEMP: AI structuring is not implemented yet.
    // For now, complete only the raw parser stage.
    // Later, re-enable structureResumeFromJob(jobId) after lib/ai/resume-ai.ts is ready.

    await supabase.from("parse_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);

    await redis.set(`job:parse:${jobId}:status`, "completed", { ex: 3600 });

    // After structuring succeeds: write result to cache for future users with same file
    const { data: fileRow } = await supabase
      .from("resume_files")
      .select("checksum")
      .eq("id", job.resume_file_id)
      .single();

    if (fileRow?.checksum) {
      const cacheKey = `cache:parse:${fileRow.checksum}:${job.parser_mode}`;
      const cacheValue: NormalizedParseResult = {
        raw_markdown: result.raw_markdown,
        raw_text: result.raw_text,
        parsed_items: result.parsed_items,
        metadata: result.metadata,
        pages_count: result.pages_count,
      };
      await redis.set(cacheKey, JSON.stringify(cacheValue), { ex: 604800 }); // 7 days
    }

    // Release user-scoped lock
    await redis.del(`lock:parse:${job.user_id}:${fileRow?.checksum}:${job.parser_mode}`);

  } catch (err: any) {
    console.error(`Error finalizing job ${jobId}:`, err);
    await failJob(jobId, err.message);
  }
}

async function failJob(jobId: string, errorMsg: string) {
  const supabase = await createClient();
  await supabase.from("parse_jobs").update({
    status: "failed",
    error_message: errorMsg,
    failed_at: new Date().toISOString()
  }).eq("id", jobId);

  await redis.set(`job:parse:${jobId}:status`, "failed", { ex: 3600 });

  const { data: job } = await supabase.from("parse_jobs").select("resume_file_id").eq("id", jobId).single();
  if (job?.resume_file_id) {
    await supabase.from("resume_files").update({ parse_status: "failed" }).eq("id", job.resume_file_id);
  }
}

function shouldFallbackToReducto(data: NormalizedParseResult): boolean {
  const md = data.raw_markdown || "";
  if (md.length < 500) return true;

  const lowerMd = md.toLowerCase();

  // Missing important sections
  const sections = ["experience", "education", "skills", "projects", "summary", "profile"];
  let missingCount = 0;
  for (const s of sections) {
    if (!lowerMd.includes(s)) missingCount++;
  }
  if (missingCount >= 3) return true;

  // No contact info (heuristic)
  const hasEmail = /[@]/.test(md);
  const hasPhone = /[0-9+\-() ]{7,}/.test(md);
  const hasLink = /http|www|linkedin\.com|github\.com/i.test(md);
  if (!hasEmail && !hasPhone && !hasLink) return true;

  // Very low bullet count for multi-page
  const bulletCount = (md.match(/[*\-•]/gm) || []).length;
  if ((data.pages_count ?? 1) > 1 && bulletCount < 5) return true;

  return false;
}
