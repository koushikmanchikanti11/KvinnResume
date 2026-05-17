import { NextResponse } from "next/server";

// TODO: LlamaParse webhook handler
// - Validate webhook secret
// - Update parse_jobs record with result
// - Trigger AI structuring
export async function POST() {
  return NextResponse.json({ received: true });
}
