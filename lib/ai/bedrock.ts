// lib/ai/bedrock.ts — Amazon Bedrock client for Minimax 2.5 and Qwen 3
// User-facing AI features. Never expose model IDs, AWS keys, or raw AWS errors to frontend.

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
  type ContentBlock,
} from "@aws-sdk/client-bedrock-runtime"

// ── Constants ─────────────────────────────────────────────
const MAX_RETRIES = 2
const INITIAL_BACKOFF_MS = 1000
const TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "30000", 10)

// ── Model Configuration ───────────────────────────────────

/**
 * Internal model IDs read from environment variables.
 * NEVER expose these to the frontend.
 */
export const BEDROCK_MODELS = {
  MINIMAX_25: process.env.BEDROCK_MINIMAX_MODEL_ID || "",
  QWEN_3: process.env.BEDROCK_QWEN_MODEL_ID || "",
} as const

/**
 * Display names shown in the UI.
 * Map from internal alias to display name.
 */
export const BEDROCK_MODEL_DISPLAY_NAMES: Record<string, string> = {
  nano_25: "nano 2.5",
  nano_3: "nano 3",
} as const

/**
 * Map from user-facing alias to internal Bedrock model ID.
 */
export const MODEL_ALIAS_MAP: Record<string, string> = {
  nano_25: BEDROCK_MODELS.MINIMAX_25,
  nano_3: BEDROCK_MODELS.QWEN_3,
} as const

// ── Client ────────────────────────────────────────────────

function getBedrockClient(): BedrockRuntimeClient {
  const region = process.env.AWS_REGION
  if (!region) {
    throw new Error("AWS_REGION is not configured.")
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured.")
  }

  return new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

// ── Core Function ─────────────────────────────────────────

export interface BedrockMessage {
  role: "user" | "assistant"
  content: string
}

interface RunBedrockModelParams {
  modelId: string
  system?: string
  messages: BedrockMessage[]
  maxTokens?: number
}

/**
 * Run a Bedrock model using the Converse API.
 * Returns plain text output.
 *
 * Rules:
 * - Validates env variables.
 * - Adds timeout.
 * - Retries for temporary errors.
 * - Never returns raw AWS errors to route response.
 * - Logs safe server error.
 * - Returns plain text output.
 */
export async function runBedrockModel(
  params: RunBedrockModelParams
): Promise<string> {
  const { modelId, system, messages, maxTokens = 2048 } = params

  if (!modelId) {
    throw new BedrockError("AI model is not configured.")
  }

  const client = getBedrockClient()

  // Format messages for Converse API
  const formattedMessages: Message[] = messages.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content } as ContentBlock],
  }))

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        const command = new ConverseCommand({
          modelId,
          messages: formattedMessages,
          ...(system
            ? { system: [{ text: system }] }
            : {}),
          inferenceConfig: {
            maxTokens,
            temperature: 0.3,
          },
        })

        const response = await client.send(command, {
          abortSignal: controller.signal,
        })

        clearTimeout(timeout)

        // Extract text from response
        const outputMessage = response.output?.message
        if (!outputMessage?.content?.[0]) {
          throw new Error("Bedrock returned empty response")
        }

        const textContent = outputMessage.content[0]
        if ("text" in textContent && textContent.text) {
          return textContent.text
        }

        throw new Error("Bedrock response missing text content")
      } finally {
        clearTimeout(timeout)
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on non-transient errors
      if (isNonRetryable(lastError)) {
        console.error("[bedrock] Non-retryable error:", lastError.message)
        throw new BedrockError("AI is temporarily unavailable.")
      }

      // Exponential backoff for transient errors
      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
        console.warn(
          `[bedrock] Attempt ${attempt + 1} failed, retrying in ${backoff}ms...`
        )
        await sleep(backoff)
      }
    }
  }

  console.error("[bedrock] All retries exhausted:", lastError?.message)
  throw new BedrockError("AI is temporarily unavailable.")
}

// ── Convenience Wrappers ──────────────────────────────────

/**
 * Run Minimax 2.5 (nano 2.5).
 * Used for: ATS analysis, cover letters, deep resume review, full structure analysis.
 */
export async function runMinimax25(
  system: string,
  messages: BedrockMessage[],
  maxTokens?: number
): Promise<string> {
  if (!BEDROCK_MODELS.MINIMAX_25) {
    throw new BedrockError("AI model nano 2.5 is not configured.")
  }
  return runBedrockModel({
    modelId: BEDROCK_MODELS.MINIMAX_25,
    system,
    messages,
    maxTokens,
  })
}

/**
 * Run Qwen 3 (nano 3).
 * Used for: Quick rewrites, bullets, summary, grammar, normal chat.
 */
export async function runQwen3(
  system: string,
  messages: BedrockMessage[],
  maxTokens?: number
): Promise<string> {
  if (!BEDROCK_MODELS.QWEN_3) {
    throw new BedrockError("AI model nano 3 is not configured.")
  }
  return runBedrockModel({
    modelId: BEDROCK_MODELS.QWEN_3,
    system,
    messages,
    maxTokens,
  })
}

/**
 * Resolve a model alias to the internal Bedrock model ID.
 * Returns the model ID or throws if the alias is invalid.
 */
export function resolveModelAlias(alias: string): string {
  const modelId = MODEL_ALIAS_MAP[alias]
  if (!modelId) {
    throw new BedrockError("Invalid model selection.")
  }
  return modelId
}

// ── Error Class ───────────────────────────────────────────

/**
 * Custom error class for Bedrock failures.
 * Used to distinguish Bedrock errors from other runtime errors.
 * Message is always user-safe (never contains raw AWS details).
 */
export class BedrockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BedrockError"
  }
}

// ── Helpers ───────────────────────────────────────────────

function isNonRetryable(error: Error): boolean {
  const msg = error.message.toLowerCase()
  return (
    msg.includes("validation") ||
    msg.includes("access denied") ||
    msg.includes("not authorized") ||
    msg.includes("not found") ||
    msg.includes("invalid") ||
    msg.includes("malformed")
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
