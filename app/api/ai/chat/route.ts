import { NextResponse } from "next/server";

// TODO: POST AI chat assistant
// - Resume advice, career guidance, interview prep
// - Context-aware responses based on resume data
export async function POST() {
  return NextResponse.json({ message: "AI response" });
}
