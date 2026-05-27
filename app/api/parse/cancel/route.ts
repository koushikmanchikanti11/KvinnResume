import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis/client";
import { addCredits } from "@/lib/credits/credit-service";
import { cancelLlamaParseJob } from "@/lib/parsers/llamaparse";
import { cancelReductoJob } from "@/lib/parsers/reducto";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId } = body as { jobId: string };

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // 1. Validate job ownership
    const { data: job, error: jobError } = await supabase
      .from("parse_jobs")
      .select("id, provider, external_job_id, status, credits_used, refunded, resume_file_id, parser_mode")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    if (job.status === "completed" || job.status === "cancelled") {
      return NextResponse.json({ error: `Job is already ${job.status}` }, { status: 400 });
    }

    // 2. Call provider cancel API
    if (job.external_job_id) {
      try {
        if (job.provider === "llamaparse") {
           // Wait, LlamaParse might not have a direct cancel endpoint, or we can just ignore
           // According to docs, Reducto has one. We'll implement them gracefully.
           await cancelLlamaParseJob(job.external_job_id).catch(() => {});
        } else if (job.provider === "reducto") {
           await cancelReductoJob(job.external_job_id).catch(() => {});
        }
      } catch (cancelErr) {
        console.error("Provider cancel error:", cancelErr);
      }
    }

    // 3. Update status to cancelled
    await supabase
      .from("parse_jobs")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", jobId);

    await redis.set(`job:parse:${jobId}:status`, "cancelled", { ex: 3600 });

    // 4. Refund credits
    if (!job.refunded && job.credits_used && job.credits_used > 0) {
      await addCredits(user.id, job.credits_used, "parse_refund_failed_job", "parse_jobs", jobId);
      await supabase
        .from("parse_jobs")
        .update({ refunded: true })
        .eq("id", jobId);
    }

    // Remove lock just in case
    const { data: file } = await supabase.from("resume_files").select("checksum").eq("id", job.resume_file_id).single();
    if (file && file.checksum) {
      // Use the correct user-scoped lock key format, and use parser_mode from the job
      // @ts-ignore - Supabase type for parser_mode if it's missing from local type defs
      const parserMode = job.parser_mode || job.mode;
      await redis.del(`lock:parse:${user.id}:${file.checksum}:${parserMode}`);
    }

    return NextResponse.json({ message: "Job cancelled and refunded if applicable" }, { status: 200 });
  } catch (err: any) {
    console.error("Parse cancel error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
