import { NextResponse } from "next/server";

// TODO: GET parse job status by job ID
// - Return current status (pending, parsing, completed, failed)
// - Return parsed result if completed
export async function GET() {
  return NextResponse.json({ status: "pending" });
}
