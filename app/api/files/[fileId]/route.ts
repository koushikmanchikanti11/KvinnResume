import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFile } from "@/lib/supabase/storage";
import { cancelLlamaParseJob } from "@/lib/parsers/llamaparse";
import { cancelReductoJob } from "@/lib/parsers/reducto";
import { addCredits } from "@/lib/credits/credit-service";
import { redis } from "@/lib/redis/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: file, error: fileError } = await supabase
      .from("resume_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(file, { status: 200 });

  } catch (err: any) {
    console.error("File GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: file, error: fileError } = await supabase
      .from("resume_files")
      .select("id, storage_path, checksum")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Find any pending/running parse jobs for this file
    const { data: pendingJobs } = await supabase
      .from("parse_jobs")
      .select("id, provider, external_job_id, status, credits_used, refunded")
      .eq("resume_file_id", fileId)
      .eq("user_id", user.id)
      .in("status", ["pending", "running"]);

    if (pendingJobs && pendingJobs.length > 0) {
      for (const job of pendingJobs) {
        // Cancel external jobs
        if (job.external_job_id) {
          try {
            if (job.provider === "llamaparse") {
              await cancelLlamaParseJob(job.external_job_id).catch(() => {});
            } else if (job.provider === "reducto") {
              await cancelReductoJob(job.external_job_id).catch(() => {});
            }
          } catch (e) {
            console.error("Cancel failed on delete:", e);
          }
        }
        
        // Update job status to cancelled
        await supabase
          .from("parse_jobs")
          .update({ status: "cancelled" })
          .eq("id", job.id);

        await redis.set(`job:parse:${job.id}:status`, "cancelled", { ex: 3600 });

        // Refund credits
        if (!job.refunded && job.credits_used && job.credits_used > 0) {
          await addCredits(user.id, job.credits_used, "parse_refund_failed_job", "parse_jobs", job.id);
          await supabase
            .from("parse_jobs")
            .update({ refunded: true })
            .eq("id", job.id);
        }
      }
    }

    // Soft delete DB record
    await supabase
      .from("resume_files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", fileId);

    // Hard delete from Supabase storage
    if (file.storage_path) {
      await deleteFile(supabase, "resume-originals", file.storage_path).catch((e) => {
        console.error("Failed to delete file from storage", e);
      });
    }

    if (file.checksum) {
      await redis.del(`lock:parse:${file.checksum}`);
    }

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("File DELETE error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
