import { NextResponse } from "next/server";

// TODO: POST upload file to Supabase Storage
// - Validate file type (PDF, DOCX, DOC, TXT)
// - Validate file size
// - Upload to resume-originals bucket
// - Create resume_files record
export async function POST() {
  return NextResponse.json({ message: "File uploaded" }, { status: 201 });
}
