/**
 * KvinnResume — Resume List & Create API
 *
 * GET  /api/resumes     → List all resumes for authenticated user
 * POST /api/resumes     → Create a new blank resume
 */

import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createEmptyResumeData } from "@/lib/resume/schema";

// ── GET — List user resumes ──────────────────────────────────

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: resumes, error } = await supabase
    .from("resumes")
    .select(
      "id, title, theme, published, visibility, updated_at, created_at, ats_score, slug"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[GET /api/resumes] Supabase error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ resumes: resumes ?? [] });
}

// ── POST — Create new resume ─────────────────────────────────

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; template?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional — defaults are used
  }

  const title = body.title?.trim() || "Untitled Resume";
  const theme = body.template || "pixel";
  const resumeJson = createEmptyResumeData();

  const supabase = await createClient();
  const { data: resume, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      resume_json: resumeJson as any,
      theme,
      visibility: "private",
      published: false,
    })
    .select("id, title, theme, visibility, published, created_at, updated_at")
    .single();

  if (error) {
    console.error("[POST /api/resumes] Supabase error:", error.message);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }

  return NextResponse.json({ resume }, { status: 201 });
}
