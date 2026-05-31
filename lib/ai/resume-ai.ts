// lib/ai/resume-ai.ts — AI orchestration layer
// Controls DB orchestration, validation, resume creation, and parsed_json saving.
// The ONLY function allowed to create initial resume_json automatically is
// structureResumeFromJob after schema validation.

import { createClient } from "@/lib/supabase/server"
import { redis } from "@/lib/redis/client"
import { structureResumeWithGroq } from "./groq"
import { safeParseResumeJson, repairResumeJsonIfNeeded, validateResumeJson } from "./schema-validator"
import { calculateResumeQualityScore } from "./quality-check"
import type { ResumeStructureResult } from "@/types/ai"

// Local Json type compatible with Supabase JSON column typing
type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

// ── Structure Resume From Job ─────────────────────────────
/**
 * Orchestration function called by parser-router after raw parse completes.
 *
 * Steps:
 * 1. Fetch parse_jobs row by jobId.
 * 2. Verify job exists.
 * 3. Verify raw_markdown or raw_text exists.
 * 4. Verify user_id exists.
 * 5. Check if a resume already exists for this parse job via source_parse_job_id.
 * 6. If resume exists and parsed_json exists, return existing resumeId.
 * 7. Call structureResumeWithGroq(rawMarkdown).
 * 8. Validate AI JSON using schema-validator.ts.
 * 9. If invalid, repair once.
 * 10. Save validated JSON into parse_jobs.parsed_json.
 * 11. Update parse_jobs.status to completed.
 * 12. Create new resumes row.
 * 13. Store resume_json in resumes.resume_json.
 * 14. Set title from parsedJson.basics.fullName if available.
 * 15. Set default theme to "pixel".
 * 16. Set visibility to private.
 * 17. Return resumeId and parsedJson.
 *
 * Does NOT deduct credits (included in parse cost).
 */
export async function structureResumeFromJob(
  jobId: string
): Promise<ResumeStructureResult> {
  const supabase = await createClient()

  // 1. Fetch parse_jobs row
  const { data: job, error: jobError } = await supabase
    .from("parse_jobs")
    .select("*, resume_files(original_filename)")
    .eq("id", jobId)
    .single()

  if (jobError || !job) {
    throw new StructureError(`Parse job ${jobId} not found.`)
  }

  // 2-3. Verify raw content exists
  const rawContent = job.raw_markdown || job.raw_text
  if (!rawContent) {
    throw new StructureError(
      `Parse job ${jobId} has no raw_markdown or raw_text.`
    )
  }

  // 4. Verify user_id
  if (!job.user_id) {
    throw new StructureError(`Parse job ${jobId} has no user_id.`)
  }

  // 5-6. Check for existing resume (duplicate prevention)
  const { data: existingResume } = await supabase
    .from("resumes")
    .select("id, resume_json")
    .eq("source_parse_job_id", jobId)
    .eq("user_id", job.user_id)
    .maybeSingle()


  if (existingResume) {
    const existingParsedJson =
      (existingResume.resume_json as any) || (job.parsed_json as any);

    const qualityScore = calculateResumeQualityScore(existingParsedJson);

    await supabase
      .from("parse_jobs")
      .update({
        status: "completed",
        quality_score: qualityScore,
        parsed_json: existingParsedJson as unknown as Json,
        metadata: {
          ...(job.metadata as Record<string, unknown>),
          resume_id: existingResume.id,
        } as unknown as Json,
      })
      .eq("id", jobId)
      .eq("user_id", job.user_id);

    if (job.resume_file_id) {
      await supabase
        .from("resume_files")
        .update({
          parse_status: "completed",
          resume_id: existingResume.id,
        })
        .eq("id", job.resume_file_id)
        .eq("user_id", job.user_id);
    }

    await redis.set(`job:parse:${jobId}:status`, "completed", { ex: 3600 });

    return {
      resumeId: existingResume.id,
      parsedJson: existingParsedJson as Record<string, unknown>,
    };
  }

  // 7. Call Groq for structuring
  let jsonString: string
  try {
    jsonString = await structureResumeWithGroq(rawContent)
  } catch (error) {
    console.error("[resume-ai] Groq structuring failed:", error)
    await markStructureFailed(
      supabase,
      jobId,
      job.resume_file_id,
      "AI structuring service failed.",
      job.user_id,

    )
    throw new StructureError("AI structuring failed.")
  }

  // 8. Validate AI JSON
  let validationResult = safeParseResumeJson(jsonString)

  // 9. If invalid, repair once
  if (!validationResult.success) {
    console.warn(
      `[resume-ai] Initial validation failed for job ${jobId}: ${validationResult.error}`
    )
    validationResult = await repairResumeJsonIfNeeded(jsonString, rawContent)
  }

  // If still invalid after repair, fail safely
  if (!validationResult.success) {
    console.error(
      `[resume-ai] Structure failed completely for job ${jobId}: ${validationResult.error}`
    )
    await markStructureFailed(
      supabase,
      jobId,
      job.resume_file_id,
      validationResult.error,
      job.user_id
    )
    throw new StructureError(validationResult.error)
  }

  const parsedJson = validationResult.data
  const qualityScore = calculateResumeQualityScore(parsedJson)

  // 10. Save validated JSON into parse_jobs.parsed_json
  // 11. Update status
  // Determine title
  // @ts-ignore - Supabase join typing
  const originalFilename =
    job.resume_files?.original_filename || "My Resume"
  const baseName = originalFilename.replace(/\.[^/.]+$/, "") // strip extension
  const title =
    parsedJson.basics?.fullName && parsedJson.basics.fullName.trim()
      ? parsedJson.basics.fullName.trim()
      : baseName || "Untitled Resume"

  // Generate unique slug
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  if (!slug) slug = "resume"
  const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 8)}`

  // 12-16. Create new resumes row
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .insert({
      user_id: job.user_id,
      title,
      slug: uniqueSlug,
      theme: "pixel",
      resume_json: parsedJson as unknown as Json,
      visibility: "private",
      published: false,
      source_parse_job_id: jobId,
    })
    .select("id")
    .single()

  if (resumeError || !resume) {
    console.error("[resume-ai] Failed to create resume:", resumeError?.message)
    throw new StructureError("Failed to create resume record.")
  }

  const existingMetadata =
    job.metadata && typeof job.metadata === "object" && !Array.isArray(job.metadata)
      ? (job.metadata as Record<string, unknown>)
      : {};

  // Update parse_jobs with parsed_json, quality_score, and resume reference
  const { error: updateJobError } = await supabase
    .from("parse_jobs")
    .update({
      status: "completed",
      parsed_json: parsedJson as unknown as Json,
      quality_score: qualityScore,
      error_message: null,
      completed_at: new Date().toISOString(),
      metadata: {
        ...existingMetadata,
        resume_id: resume.id,
        structured_at: new Date().toISOString(),
      } as unknown as Json,
    })
    .eq("id", jobId)
    .eq("user_id", job.user_id)


  if (updateJobError) {
    console.error("[resume-ai] Failed to update parse job:", updateJobError.message)
    throw new StructureError("Resume was created, but parse job update failed.")
  }

  // Update resume_files
  if (job.resume_file_id) {
    await supabase
      .from("resume_files")
      .update({
        parse_status: "completed",
        resume_id: resume.id,
      })
      .eq("id", job.resume_file_id)
      .eq("user_id", job.user_id)
  }

  // Update Redis cache
  await redis.set(`job:parse:${jobId}:status`, "completed", { ex: 3600 })

  console.log(
    `[resume-ai] Successfully structured job ${jobId} → resume ${resume.id}`
  )

  // 17. Return resumeId and parsedJson
  return {
    resumeId: resume.id,
    parsedJson: parsedJson as unknown as Record<string, unknown>,
  }
}

// ── Helpers ───────────────────────────────────────────────

/**
 * Mark a parse job as failed because AI structuring failed.
 * Keeps raw_markdown/raw_text saved. Does not create broken resume.
 */
async function markStructureFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  resumeFileId: string | null,
  errorMessage: string,
  userId: string,
): Promise<void> {
  await supabase
    .from("parse_jobs")
    .update({
      status: "failed",
      error_message: errorMessage,
      parsed_json: null,
    })
    .eq("id", jobId)
    .eq("user_id", userId)

  await redis.set(`job:parse:${jobId}:status`, "failed", {
    ex: 3600,
  })

  if (resumeFileId) {
    await supabase
      .from("resume_files")
      .update({ parse_status: "failed" })
      .eq("id", resumeFileId)
      .eq("user_id", userId)
  }
}

/**
 * Custom error class for structure failures.
 * Used to distinguish structure errors from other runtime errors.
 */
export class StructureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StructureError"
  }
}
