import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimits } from "@/lib/redis/rate-limit";
import { redis } from "@/lib/redis/client";
import { canParse, isParserModeAllowed, hasEnoughCredits } from "@/lib/credits/plan-checker";
import { deductCredits, incrementParseCount, addCredits } from "@/lib/credits/credit-service";
import { startParseJob } from "@/lib/parsers/parser-router";
import { ParseMode, NormalizedParseResult } from "@/types/parser";
import { CREDIT_COSTS } from "@/lib/credits/pricing";
import { structureResumeFromJob } from "@/lib/ai/resume-ai";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await rateLimits.parserJob.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const { fileId, mode } = body as { fileId: string; mode: ParseMode };

    if (!fileId || !mode) {
      return NextResponse.json({ error: "fileId and mode are required" }, { status: 400 });
    }

    // 1. Validate file ownership
    const { data: file, error: fileError } = await supabase
      .from("resume_files")
      .select("id, storage_path, checksum, parse_status")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });
    }

    // 2. Check plan allows this mode
    let modeCheck = 'fast';
    if (mode === 'nano_pro') modeCheck = 'deep';
    else if (mode === 'auto') modeCheck = 'auto';

    const modeAllowed = await isParserModeAllowed(user.id, modeCheck);
    if (!modeAllowed) {
      return NextResponse.json({ error: "Mode not allowed for your plan" }, { status: 403 });
    }

    // 3. Check monthly parse capacity
    const { allowed: canParseAllowed } = await canParse(user.id);
    if (!canParseAllowed) {
      return NextResponse.json({ error: "Monthly parse limit reached" }, { status: 403 });
    }

    // 4. Check credit balance
    let feature: "parse_nano" | "parse_nano_mini" | "parse_nano_pro" | "parse_auto_max_reserve";
    if (mode === 'nano') feature = 'parse_nano';
    else if (mode === 'nano_mini') feature = 'parse_nano_mini';
    else if (mode === 'nano_pro') feature = 'parse_nano_pro';
    else feature = 'parse_auto_max_reserve';

    const cost = CREDIT_COSTS[feature];
    const { allowed: creditsAllowed } = await hasEnoughCredits(user.id, cost);
    if (!creditsAllowed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // 5. Check Redis cache by file checksum (stores NormalizedParseResult JSON, not jobId)
    const cacheKey = `cache:parse:v2:${file.checksum}:${mode}`;
    const cachedRaw = await redis.get(cacheKey);

    if (cachedRaw) {
      // Cache hit — create a NEW completed job for this user using cached result
      let cached: NormalizedParseResult | null = null;

      try {
        // Branch 1: String cache (JSON serialized)
        if (typeof cachedRaw === "string") {
          const parsed = JSON.parse(cachedRaw) as any;

          // Strict validation: check for required fields with proper type and non-empty content
          const isValidCachedResult =
            parsed &&
            typeof parsed === "object" &&
            typeof parsed.raw_markdown === "string" &&
            parsed.raw_markdown.length > 0;

          if (isValidCachedResult) {
            cached = parsed as NormalizedParseResult;
          } else {
            console.warn(`[Cache Hit] Invalid cached result shape for ${cacheKey}`);
            await redis.del(cacheKey);
          }
        }
        // Branch 2: Object cache (Redis client returns parsed)
        else if (
          typeof cachedRaw === "object" &&
          cachedRaw !== null &&
          typeof (cachedRaw as any).raw_markdown === "string" &&
          (cachedRaw as any).raw_markdown.length > 0
        ) {
          cached = cachedRaw as NormalizedParseResult;
        }
        // Branch 3: Invalid format
        else {
          console.warn(`[Cache Hit] Invalid non-string cache format for ${cacheKey}`);
          await redis.del(cacheKey);
        }
      } catch (parseError) {
        console.warn(`[Cache Hit] Invalid cache JSON for ${cacheKey}:`, parseError);
        await redis.del(cacheKey);
        cached = null;
      }

      // If we have valid cache, use it
      if (cached) {
        // Still deduct credits and increment parse count (cache is speed, not free)
        await deductCredits(user.id, feature, "parse_jobs", undefined, { fileId, mode });
        await incrementParseCount(user.id);

        const jobId = crypto.randomUUID();
        const cachedProvider = (cached.metadata as any)?.provider;
        const provider =
          cachedProvider === "reducto" || cachedProvider === "llamaparse"
            ? cachedProvider
            : mode === "nano_pro"
              ? "reducto"
              : "llamaparse";

        const { error: cachedInsertError } = await supabase.from("parse_jobs").insert({
          id: jobId,
          user_id: user.id,
          resume_file_id: file.id,
          provider,
          parser_mode: mode,
          status: "running",
          credits_used: cost,
          raw_markdown: cached.raw_markdown,
          raw_text: cached.raw_text,
          parsed_items: cached.parsed_items,
          pages_count: cached.pages_count,
          completed_at: null,
          metadata: { ...cached.metadata, from_cache: true },
        });

        if (cachedInsertError) {
          await addCredits(user.id, cost, "parse_refund_failed_job", "parse_jobs", jobId);
          return NextResponse.json(
            { error: "Failed to create cached parse job" },
            { status: 500 }
          );
        }

        await redis.set(`job:parse:${jobId}:status`, "running", { ex: 3600 });
        await redis.set(`job:parse:${jobId}:owner`, user.id, { ex: 3600 });

        // Update file status
        await supabase.from("resume_files").update({
          parse_status: "running",
          parser_mode: mode
        }).eq("id", file.id)
          .eq("user_id", user.id);

        // Trigger AI structuring for this user's job (fire and forget)
        structureResumeFromJob(jobId).catch(async (error) => {
          await supabase.from("parse_jobs").update({
            status: "failed",
            error_message: error?.message || "AI structuring failed",
            failed_at: new Date().toISOString(),
          }).eq("id", jobId).eq("user_id", user.id);

          await supabase.from("resume_files").update({
            parse_status: "failed",
          }).eq("id", file.id).eq("user_id", user.id);

          await addCredits(user.id, cost, "parse_refund_failed_job", "parse_jobs", jobId);
          await redis.set(`job:parse:${jobId}:status`, "failed", { ex: 3600 });
        });
        return NextResponse.json({ jobId, status: "running", cached: true }, { status: 201 });
      }
      // If cached is null, fall through to fresh parse below
    }

    // 6. Acquire Redis lock (user-scoped to prevent same user double-submit)
    const lockKey = `lock:parse:${user.id}:${file.checksum}:${mode}`;
    const locked = await redis.setnx(lockKey, "1");
    if (locked) {
      await redis.expire(lockKey, 300); // 5 mins
    } else {
      return NextResponse.json({ error: "Parsing already in progress for this file" }, { status: 409 });
    }

    // 7. Deduct credits
    await deductCredits(user.id, feature, "parse_jobs", undefined, { fileId, mode });

    // 8. Increment monthly parse count
    await incrementParseCount(user.id);

    // 9. Create parse_jobs row
    const jobId = crypto.randomUUID();
    const provider = mode === "nano_pro" ? "reducto" : "llamaparse";

    const { error: insertError } = await supabase
      .from("parse_jobs")
      .insert({
        id: jobId,
        user_id: user.id,
        resume_file_id: file.id,
        provider,
        parser_mode: mode,
        status: "pending",
        credits_used: cost,
      });

    if (insertError) {
      // Refund credits and release lock on insert failure
      await addCredits(user.id, cost, "parse_refund_failed_job", "parse_jobs", jobId);
      await redis.del(lockKey);
      return NextResponse.json({ error: "Failed to create parse job" }, { status: 500 });
    }

    await redis.set(`job:parse:${jobId}:status`, "pending", { ex: 3600 });
    await redis.set(`job:parse:${jobId}:owner`, user.id, { ex: 3600 });
    // NOTE: cache write removed — it now happens in finalizeParseJob after completion

    // Update file status
    await supabase.from("resume_files").update({
      parse_status: "running",
      parser_mode: mode
    }).eq("id", file.id).eq("user_id", user.id);

    // 10. Route to parser (await fast startup call)
    try {
      await startParseJob(mode, jobId);
    } catch (error: any) {
      await supabase
        .from("parse_jobs")
        .update({
          status: "failed",
          error_message: error?.message || "Failed to start parser",
          failed_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("user_id", user.id);

      await supabase
        .from("resume_files")
        .update({ parse_status: "failed" })
        .eq("id", file.id)
        .eq("user_id", user.id);

      await addCredits(user.id, cost, "parse_refund_failed_job", "parse_jobs", jobId);
      await redis.del(lockKey);

      return NextResponse.json(
        { error: error?.message || "Failed to start parser" },
        { status: 500 }
      );
    }

    // 11. Return jobId
    return NextResponse.json({ jobId, status: "running" }, { status: 201 });

  } catch (err: any) {
    console.error("Parse start error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}