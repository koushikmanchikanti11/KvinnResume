import { NextResponse } from "next/server";

// TODO: POST structure parsed text into ResumeData JSON
// - Accept raw parsed text from LlamaParse/Reducto
// - Use Groq AI to structure into resume schema
// - Validate with Zod
export async function POST() {
  return NextResponse.json({ message: "Structured" });
}
