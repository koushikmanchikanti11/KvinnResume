import { NextResponse } from "next/server";

// TODO: POST start a parse job
// - Validate user credits and tier permissions
// - Route to LlamaParse or Reducto based on selected mode
// - Create parse_jobs record
// - Add to Redis queue
export async function POST() {
  return NextResponse.json({ message: "Parse job started" }, { status: 201 });
}
