import { NextResponse } from "next/server";

// TODO: GET export resume as PDF via Puppeteer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params;
  return NextResponse.json({ resumeId, message: "PDF export pending" });
}
