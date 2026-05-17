import { NextResponse } from "next/server";

// TODO: POST publish resume — generate public slug, update visibility
export async function POST(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params;
  return NextResponse.json({ resumeId, message: "Published" });
}
