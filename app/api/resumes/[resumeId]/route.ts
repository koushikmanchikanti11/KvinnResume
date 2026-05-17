import { NextResponse } from "next/server";

// TODO: GET single resume by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params;
  return NextResponse.json({ resumeId });
}

// TODO: PATCH update resume
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params;
  return NextResponse.json({ resumeId, message: "Updated" });
}

// TODO: DELETE resume
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await params;
  return NextResponse.json({ resumeId, message: "Deleted" });
}
