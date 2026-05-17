import { NextResponse } from "next/server";

// TODO: GET all resumes for authenticated user
export async function GET() {
  return NextResponse.json({ resumes: [] });
}

// TODO: POST create new resume
export async function POST() {
  return NextResponse.json({ message: "Resume created" }, { status: 201 });
}
