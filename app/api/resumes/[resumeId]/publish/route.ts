/**
 * KvinnResume — Publish Resume API
 *
 * POST /api/resumes/[resumeId]/publish
 *
 * Publishes a resume with a unique slug.
 * Checks plan limits before allowing publish.
 */

import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { canPublishResume, PUBLISH_LIMIT_ERROR } from "@/lib/credits/plan-checker";
import { deleteCache } from "@/lib/redis/cache";
import { redisKeys } from "@/lib/redis/keys";

type RouteContext = {
  params: Promise<{ resumeId: string }>;
};

// Slug validation: lowercase letters, numbers, hyphens. 3–60 chars.
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await params;
  const supabase = await createClient();

  // 1. Validate ownership
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id, user_id, published")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  if (resume.published) {
    return NextResponse.json(
      { error: "Resume is already published" },
      { status: 409 }
    );
  }

  // 2. Check plan limits
  const publishCheck = await canPublishResume(user.id);
  if (!publishCheck.allowed) {
    return NextResponse.json(PUBLISH_LIMIT_ERROR, { status: 403 });
  }

  // 3. Parse request body
  let body: {
    slug?: string;
    visibility?: string;
    enablePdfDownload?: boolean;
    enableAnalytics?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const slug = body.slug?.toLowerCase().trim();
  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      {
        error:
          "Invalid slug. Must be 3–60 characters, lowercase letters, numbers, and hyphens only.",
      },
      { status: 400 }
    );
  }

  const visibility = body.visibility || "public";

  // 4. Check slug uniqueness in published_resumes (active only)
  const { data: existingSlug } = await supabase
    .from("published_resumes")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (existingSlug) {
    return NextResponse.json(
      { error: "This slug is already taken. Please choose another." },
      { status: 409 }
    );
  }

  // 5. Insert published_resumes row
  const { error: publishError } = await supabase
    .from("published_resumes")
    .insert({
      resume_id: resumeId,
      user_id: user.id,
      slug,
      is_active: true,
      metadata: {
        enablePdfDownload: body.enablePdfDownload ?? true,
        enableAnalytics: body.enableAnalytics ?? true,
      },
    });

  if (publishError) {
    console.error("[POST /publish] Insert published_resumes error:", publishError.message);
    return NextResponse.json(
      { error: "Failed to publish resume" },
      { status: 500 }
    );
  }

  // 6. Update resumes row
  const { error: resumeUpdateError } = await supabase
    .from("resumes")
    .update({
      published: true,
      published_at: new Date().toISOString(),
      visibility,
      slug,
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (resumeUpdateError) {
    console.error("[POST /publish] Update resumes error:", resumeUpdateError.message);
  }

  // 7. Increment public_resume_count and set slug on profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      public_resume_count: (publishCheck.remaining > 0)
        ? undefined  // Let SQL handle the increment below
        : undefined,
      published_resume_slug: slug,
      published_resume_url: `/r/${slug}`,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("[POST /publish] Update profiles error:", profileError.message);
  }

  // Increment public_resume_count atomically via RPC-style update
  try {
    const { error: rpcError } = await supabase.rpc("increment_public_resume_count" as any, {
      p_user_id: user.id,
    });
    
    if (rpcError) throw rpcError;
  } catch (err) {
    // If RPC doesn't exist, do a direct increment
    const { data: profile } = await supabase
      .from("profiles")
      .select("public_resume_count")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          public_resume_count: (profile.public_resume_count ?? 0) + 1,
        })
        .eq("id", user.id);
    }
  }

  // 8. Invalidate Redis cache
  try {
    await deleteCache(redisKeys.cache.publicResume(slug));
    await deleteCache(`cache:resume-public:${slug}`);
  } catch {
    // Redis failure is non-fatal
  }

  // 9. Return success
  return NextResponse.json({
    success: true,
    url: `/r/${slug}`,
  });
}
