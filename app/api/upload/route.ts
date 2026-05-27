import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadFile } from "@/lib/supabase/storage";
import { rateLimits } from "@/lib/redis/rate-limit";
import crypto from "crypto";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await rateLimits.uploadResume.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Check for existing file with same checksum for this user
    const { data: existingFile } = await supabase
      .from("resume_files")
      .select("id, original_filename, pages_count")
      .eq("user_id", user.id)
      .eq("checksum", hash)
      .maybeSingle();

    if (existingFile) {
      return NextResponse.json({
        fileId: existingFile.id,
        filename: existingFile.original_filename,
        pages_estimate: existingFile.pages_count,
        message: "File already exists",
      }, { status: 200 });
    }

    // Leaves pages_estimate null initially; the parser will determine actual count
    const pages_estimate = null;

    const fileId = crypto.randomUUID();
    const ext = file.name.split('.').pop();
    const storagePath = `${user.id}/${fileId}.${ext}`;

    await uploadFile(supabase, "resume-originals", storagePath, buffer, {
      contentType: file.type,
    });

    const { data: insertedFile, error: insertError } = await supabase
      .from("resume_files")
      .insert({
        id: fileId,
        user_id: user.id,
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        checksum: hash,
        parse_status: "not_started",
        pages_count: pages_estimate,
        uploaded_from: "web",
      })
      .select("id, original_filename, pages_count")
      .single();

    if (insertError || !insertedFile) {
      console.error("Failed to insert resume_file:", insertError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      fileId: insertedFile.id,
      filename: insertedFile.original_filename,
      pages_estimate: insertedFile.pages_count,
    }, { status: 201 });

  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
