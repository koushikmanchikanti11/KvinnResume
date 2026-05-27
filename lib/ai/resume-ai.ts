import { createClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis/client";
import { structureResumeWithGroq, repairResumeJSONWithGroq } from "./groq";
import { validateAIOutput } from "./schema-validator";

export async function structureResumeFromJob(jobId: string) {
  const supabase = await createClient();

  try {
    // 1. Fetch parse_jobs row
    const { data: job, error: jobError } = await supabase
      .from("parse_jobs")
      .select("*, resume_files(original_filename)")
      .eq("id", jobId)
      .single();

    if (jobError || !job || !job.raw_markdown) {
      throw new Error(`Parse job ${jobId} not found or missing raw_markdown`);
    }

    const rawText = job.raw_markdown;
    
    // 2. Call structureResumeWithGroq
    let jsonString = await structureResumeWithGroq(rawText);
    let parsedJSON;
    let isValid = false;

    // 3. Validate
    try {
      parsedJSON = JSON.parse(jsonString);
      const validation = validateAIOutput(parsedJSON);
      if (validation.success) {
        isValid = true;
      } else {
        console.warn("AI output validation failed:", validation.error);
      }
    } catch (e) {
      console.warn("JSON Parse error:", e);
    }

    // 5. Retry once if invalid
    if (!isValid) {
      console.log(`Retrying structure for job ${jobId}`);
      jsonString = await repairResumeJSONWithGroq(rawText, jsonString);
      try {
        parsedJSON = JSON.parse(jsonString);
        const validation = validateAIOutput(parsedJSON);
        if (validation.success) {
          isValid = true;
        } else {
           console.error("AI output validation failed again:", validation.error);
        }
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      console.error(`Structure failed completely for job ${jobId}`);
      await supabase.from("parse_jobs").update({ status: "structure_failed" }).eq("id", jobId);
      await redis.set(`job:parse:${jobId}:status`, "structure_failed", { ex: 3600 });
      await supabase.from("resume_files").update({ parse_status: "failed" }).eq("id", job.resume_file_id);
      return;
    }

    // 4. On success: insert into resumes, update parse_jobs, write status
    // @ts-ignore
    const originalFilename = job.resume_files?.original_filename || "My Resume";
    const title = originalFilename.replace(/\.[^/.]+$/, ""); // strip extension

    // Generate unique slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!slug) slug = "resume";
    const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: job.user_id,
        title: title,
        slug: uniqueSlug,
        resume_json: parsedJSON,
        visibility: "private",
        published: false,
      })
      .select("id")
      .single();

    if (resumeError || !resume) {
      throw new Error(`Failed to insert resume: ${resumeError?.message}`);
    }

    await supabase.from("parse_jobs").update({
      status: "completed",
      parsed_json: parsedJSON,
      metadata: { ...((job.metadata as object) || {}), resume_id: resume.id }
    }).eq("id", jobId);

    // Also update resume_files to completed
    await supabase.from("resume_files").update({
      parse_status: "completed",
      resume_id: resume.id
    }).eq("id", job.resume_file_id);

    await redis.set(`job:parse:${jobId}:status`, "completed", { ex: 3600 });
    
  } catch (err: any) {
    console.error(`structureResumeFromJob error for ${jobId}:`, err);
    const supabase = await createClient();
    await supabase.from("parse_jobs").update({ status: "structure_failed" }).eq("id", jobId);
    await redis.set(`job:parse:${jobId}:status`, "structure_failed", { ex: 3600 });
    
    // Also try to update resume_files if we know the id
    const { data: job } = await supabase.from("parse_jobs").select("resume_file_id").eq("id", jobId).single();
    if (job?.resume_file_id) {
      await supabase.from("resume_files").update({ parse_status: "failed" }).eq("id", job.resume_file_id);
    }
  }
}
