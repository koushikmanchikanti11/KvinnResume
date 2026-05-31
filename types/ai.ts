// types/ai.ts — AI feature types for KvinnResume Phase 6

// ── Model Aliases & Display Names ─────────────────────────
export type AIModelAlias = "nano_25" | "nano_3"
export type AIModelDisplayName = "nano 2.5" | "nano 3"

export const AI_MODEL_DISPLAY: Record<AIModelAlias, AIModelDisplayName> = {
  nano_25: "nano 2.5",
  nano_3: "nano 3",
} as const

// ── AI Feature identifiers ────────────────────────────────
export type AIFeature =
  | "structure_resume"
  | "enhance_section"
  | "generate_bullets"
  | "improve_summary"
  | "ats_optimization"
  | "cover_letter"
  | "resume_chat"
  | "grammar_fix"
  | "full_resume_improvement"

// ── Chat Messages ─────────────────────────────────────────
export interface AIMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  model?: AIModelAlias
  timestamp: string
}

// ── AI Suggestion (for enhance, bullet, summary routes) ───
export interface AISuggestion {
  before: string
  after: string
  reason: string
  confidence: number
  warnings: string[]
}

// ── AI Diff (for inline diff rendering) ───────────────────
export interface AIDiff {
  section: string
  field: string
  before: string
  after: string
  accepted?: boolean
}

// ── ATS Diagnostic Row ────────────────────────────────────
export interface ATSDiagnosticRow {
  category: string
  status: "pass" | "warning" | "fail"
  message: string
  suggestion: string
}

export interface ATSAnalysisResult {
  score: number
  diagnostics: ATSDiagnosticRow[]
}

// ── Token Estimate ────────────────────────────────────────
export interface TokenEstimateRequest {
  feature: string
  context_length?: number
}

export interface TokenEstimateResponse {
  credit_cost: number
  current_balance: number
  can_afford: boolean
}

// ── Chat Request / Response ───────────────────────────────
export interface AIChatRequest {
  messages: { role: "user" | "assistant"; content: string }[]
  model: AIModelAlias
  resumeId?: string
}

export interface AIChatResponse {
  content: string
  model: AIModelAlias
  credits_remaining: number
}

// ── Structure Result (from internal parse → AI flow) ──────
export interface ResumeStructureResult {
  resumeId: string
  parsedJson: Record<string, unknown>
}

// ── Enhance Request ───────────────────────────────────────
export interface EnhanceRequest {
  resumeId: string
  section: string
  currentText: string
  instruction?: string
}

// ── Bullet Request ────────────────────────────────────────
export interface BulletRequest {
  resumeId?: string
  role?: string
  rawBullet?: string
  context?: string
  targetRole?: string
}

// ── Summary Request ───────────────────────────────────────
export interface SummaryRequest {
  resumeId: string
  currentSummary: string
  targetRole?: string
  tone?: string
}

// ── Cover Letter Request ──────────────────────────────────
export interface CoverLetterRequest {
  resumeId: string
  jobDescription: string
  company: string
  tone?: string
}

// ── ATS Request ───────────────────────────────────────────
export interface ATSRequest {
  resumeId: string
  jobDescription?: string
}

// ── AI Event (matches ai_events table) ────────────────────
export interface AIEventInsert {
  user_id: string
  resume_id?: string | null
  provider: "groq" | "bedrock"
  model: string
  feature: AIFeature
  input_tokens?: number | null
  output_tokens?: number | null
  credits_used: number
  status: "pending" | "completed" | "failed" | "refunded"
  error_message?: string | null
  latency_ms?: number | null
  cached?: boolean
  metadata?: Record<string, unknown> | null
}
