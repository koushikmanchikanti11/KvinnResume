/**
 * KvinnResume — Single Resume CRUD API
 *
 * GET    /api/resumes/[resumeId]  → Fetch single resume (auth + ownership)
 * PATCH  /api/resumes/[resumeId]  → Update resume_json / theme / title (auto-save target)
 * DELETE /api/resumes/[resumeId]  → Delete resume (must unpublish first)
 */

import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/lib/resume/schema";

type RouteContext = {
  params: Promise<{ resumeId: string }>;
};

// ── GET — Fetch single resume ────────────────────────────────

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await params;
  const supabase = await createClient();

  const { data: resume, error } = await supabase
    .from("resumes")
    .select(
      "id, title, resume_json, theme, published, visibility, slug, ats_score, updated_at, created_at, published_at, version_number"
    )
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ resume });
}

// ── PATCH — Update resume (auto-save target) ─────────────────

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Parse body — only accept allowed fields
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build update object with only allowed fields
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.resume_json !== undefined) {
    const parsed = resumeDataSchema.safeParse(body.resume_json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid resume_json",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    updatePayload.resume_json = parsed.data;
  }

  if (body.title !== undefined && typeof body.title === "string") {
    updatePayload.title = body.title.trim();
  }

  if (body.theme !== undefined && typeof body.theme === "string") {
    updatePayload.theme = body.theme;
  }

  if (
    body.visibility !== undefined &&
    (body.visibility === "public" || body.visibility === "private")
  ) {
    updatePayload.visibility = body.visibility;
  }

  const { data: updated, error: updateError } = await supabase
    .from("resumes")
    .update(updatePayload as any)
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .select("id, updated_at")
    .single();

  if (updateError) {
    console.error("[PATCH /api/resumes/[id]] Supabase error:", updateError.message);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    updated_at: updated?.updated_at,
  });
}

// ── DELETE — Delete resume ───────────────────────────────────

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await params;
  const supabase = await createClient();

  // Check ownership and publish status
  const { data: resume, error: fetchError } = await supabase
    .from("resumes")
    .select("id, published")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Reject if published — user must unpublish first
  if (resume.published) {
    return NextResponse.json(
      { error: "Unpublish before deleting" },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("[DELETE /api/resumes/[id]] Supabase error:", deleteError.message);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
