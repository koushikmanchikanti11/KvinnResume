import { NextResponse } from "next/server";

// TODO: POST AI rewrite/enhance resume content
// - Rewrite bullets, summary, experience descriptions
// - Support modes: rewrite, shorter, more_technical, more_ats
export async function POST() {
  return NextResponse.json({ message: "Enhanced" });
}
