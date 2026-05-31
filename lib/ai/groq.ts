// lib/ai/groq.ts — Groq client for internal resume structuring only
// This module ONLY handles Groq provider calls.
// It does NOT: query Supabase, update parse_jobs, create resumes, deduct credits, or redirect users.

import Groq from "groq-sdk"
import { STRUCTURE_RESUME, REPAIR_RESUME_JSON } from "./prompts"

// ── Constants ─────────────────────────────────────────────
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000
const TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "30000", 10)
const MAX_INPUT_CHARS = parseInt(process.env.AI_MAX_INPUT_CHARS || "12000", 10)

// ── Groq Client ───────────────────────────────────────────

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }
  return new Groq({ apiKey })
}

function getGroqModel(): string {
  return process.env.GROQ_MODEL || process.env.GROQ_DEFAULT_MODEL || "llama-3.3-70b-versatile"
}

// ── Core Chat Function ────────────────────────────────────

interface GroqChatOptions {
  messages: { role: "system" | "user" | "assistant"; content: string }[]
  temperature?: number
  jsonMode?: boolean
  maxTokens?: number
}

/**
 * Low-level Groq chat completion with retry and exponential backoff.
 * Returns the raw content string from the model response.
 */
export async function groqChat(options: GroqChatOptions): Promise<string> {
  const groq = getGroqClient()
  const model = getGroqModel()

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        const completion = await groq.chat.completions.create(
          {
            messages: options.messages,
            model,
            temperature: options.temperature ?? 0,
            ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
            ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
          },
          { signal: controller.signal }
        )

        clearTimeout(timeout)

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error("Groq returned empty response")
        }

        return content
      } finally {
        clearTimeout(timeout)
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on non-transient errors
      if (isNonRetryableError(lastError)) {
        console.error("[groq] Non-retryable error:", lastError.message)
        throw new Error("AI structuring service encountered an error.")
      }

      // Exponential backoff for transient errors
      if (attempt < MAX_RETRIES - 1) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
        console.warn(`[groq] Attempt ${attempt + 1} failed, retrying in ${backoff}ms...`)
        await sleep(backoff)
      }
    }
  }

  console.error("[groq] All retries exhausted:", lastError?.message)
  throw new Error("AI structuring service is temporarily unavailable.")
}

// ── Structure Resume ──────────────────────────────────────

/**
 * Convert raw resume markdown/text into structured Resume JSON using Groq.
 * Returns the raw JSON string from the model.
 *
 * This function:
 * - Accepts rawMarkdown string
 * - Rejects empty input
 * - Calls Groq with STRUCTURE_RESUME prompt
 * - Asks for strict JSON only
 * - Retries temporary failures with exponential backoff
 * - Returns raw AI text (JSON string)
 * - Logs server-safe errors only
 * - Never exposes raw Groq errors to the client
 */
export async function structureResumeWithGroq(rawMarkdown: string): Promise<string> {
  if (!rawMarkdown || rawMarkdown.trim().length === 0) {
    throw new Error("Cannot structure resume: empty input text provided.")
  }

  // Truncate if exceeding max input chars to prevent excessive token usage
  const truncatedInput = rawMarkdown.length > MAX_INPUT_CHARS
    ? rawMarkdown.slice(0, MAX_INPUT_CHARS)
    : rawMarkdown

  const content = await groqChat({
    messages: [
      {
        role: "system",
        content:
          "You are a resume structuring engine. Return only valid JSON. Do not include markdown, explanations, comments, or code fences.",
      },
      {
        role: "user",
        content: `${STRUCTURE_RESUME}

RAW RESUME MARKDOWN:
${truncatedInput}`,
      },
    ],
    temperature: 0,
    jsonMode: true,
  })

  return content
}

// ── Repair Resume JSON ────────────────────────────────────

/**
 * Attempt to repair invalid resume JSON using Groq.
 * Called once when initial structuring produces invalid JSON.
 */
export async function repairResumeJSONWithGroq(
  rawText: string,
  invalidJson: string
): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Cannot repair resume JSON: empty input text provided.")
  }

  const prompt = REPAIR_RESUME_JSON
    .replace("{{RAW_TEXT}}", rawText.slice(0, MAX_INPUT_CHARS))
    .replace("{{INVALID_JSON}}", invalidJson.slice(0, 4000))

  const content = await groqChat({
    messages: [
      {
        role: "system",
        content:
          "You are a resume structuring engine. Return only valid JSON. Do not include markdown, explanations, comments, or code fences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
    jsonMode: true,
  })

  return content
}

// ── Helpers ───────────────────────────────────────────────

function isNonRetryableError(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes("invalid api key") ||
    msg.includes("authentication") ||
    msg.includes("unauthorized") ||
    msg.includes("api key") ||
    msg.includes("not found") ||
    msg.includes("model not found")
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
