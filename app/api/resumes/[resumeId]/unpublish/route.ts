/**
 * KvinnResume — Unpublish Resume API
 *
 * POST /api/resumes/[resumeId]/unpublish
 *
 * Deactivates a published resume, decrements public_resume_count,
 * clears published slug from profile, and invalidates Redis cache.
 *
 * Without this route, free users can get permanently locked out
 * of publishing once they've used their 1 public resume slot.
 */

import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { deleteCache } from "@/lib/redis/cache";
import { redisKeys } from "@/lib/redis/keys";

type RouteContext = {
  params: Promise<{ resumeId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await params;
  const supabase = await createClient();

  // 1. Validate ownership
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id, user_id")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // 2. Find active published_resumes row
  const { data: publishedRow, error: publishedError } = await supabase
    .from("published_resumes")
    .select("id, slug")
    .eq("resume_id", resumeId)
    .eq("is_active", true)
    .single();

  if (publishedError || !publishedRow) {
    return NextResponse.json(
      { error: "Resume is not currently published" },
      { status: 404 }
    );
  }

  const slug = publishedRow.slug;

  // 3. Deactivate published_resumes row
  const { error: deactivateError } = await supabase
    .from("published_resumes")
    .update({
      is_active: false,
      unpublished_at: new Date().toISOString(),
    })
    .eq("id", publishedRow.id);

  if (deactivateError) {
    console.error("[POST /unpublish] Deactivate error:", deactivateError.message);
    return NextResponse.json(
      { error: "Failed to unpublish resume" },
      { status: 500 }
    );
  }

  // 4. Update resumes row
  const { error: resumeUpdateError } = await supabase
    .from("resumes")
    .update({
      published: false,
      visibility: "private",
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (resumeUpdateError) {
    console.error("[POST /unpublish] Update resumes error:", resumeUpdateError.message);
  }

  // 5. Decrement profiles.public_resume_count (never below 0)
  const { data: profile } = await supabase
    .from("profiles")
    .select("public_resume_count, published_resume_slug")
    .eq("id", user.id)
    .single();

  if (profile) {
    const newCount = Math.max((profile.public_resume_count ?? 1) - 1, 0);
    const updatePayload: Record<string, unknown> = {
      public_resume_count: newCount,
    };

    // 6. Clear slug/url from profile only if they match this resume
    if (profile.published_resume_slug === slug) {
      updatePayload.published_resume_slug = null;
      updatePayload.published_resume_url = null;
    }

    await supabase
      .from("profiles")
      .update(updatePayload as any)
      .eq("id", user.id);
  }

  // 7. Invalidate Redis cache
  try {
    await deleteCache(redisKeys.cache.publicResume(slug));
    await deleteCache(`cache:resume-public:${slug}`);
  } catch {
    // Redis failure is non-fatal
  }

  // 8. Return success
  return NextResponse.json({
    success: true,
    message: "Resume unpublished",
  });
}
