import { NextResponse } from "next/server";

// TODO: Implement Supabase Auth callback handler
// - Handle OAuth redirects
// - Exchange auth codes for sessions

export async function GET() {
  return NextResponse.json({ message: "Auth callback endpoint" });
}

export async function POST() {
  return NextResponse.json({ message: "Auth callback endpoint" });
}
