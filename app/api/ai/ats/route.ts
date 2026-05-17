import { NextResponse } from "next/server";

// TODO: POST ATS score analysis
// - Keyword density, action verbs, measurable impact
// - Formatting safety, section hierarchy, readability
export async function POST() {
  return NextResponse.json({ score: 0, diagnostics: [] });
}
