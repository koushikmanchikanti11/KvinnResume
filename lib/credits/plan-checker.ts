/**
 * KvinnResume — Plan Checker
 *
 * Validates whether a user's current plan allows a specific action
 * by checking their profile limits against the plan_limits table.
 */

import { createClient } from '@/lib/supabase/server'

// ── Shared Error Constants ────────────────────────────────

/** GAP 6 FIX: Well-defined error shape for publish limit. */
export const PUBLISH_LIMIT_ERROR = {
  code: 'publish_limit_reached',
  message: 'You have reached the maximum number of public resumes for your plan.',
  upgrade_url: '/dashboard/billing',
} as const

export type PlanLimitError = typeof PUBLISH_LIMIT_ERROR

export const PARSE_LIMIT_ERROR = {
  code: 'parse_limit_reached',
  message: 'You have reached the monthly parse limit for your plan.',
  upgrade_url: '/dashboard/billing',
} as const

export const INSUFFICIENT_CREDITS_ERROR = {
  code: 'insufficient_credits',
  message: 'You do not have enough credits for this action.',
  upgrade_url: '/dashboard/billing',
} as const

// ── Plan Limit Checks ────────────────────────────────────

interface PlanLimits {
  monthly_parse_limit: number
  public_resume_limit: number
  monthly_ai_credit_limit: number | null
  nano_pro_enabled: boolean
  auto_enabled: boolean
  cover_letter_enabled: boolean
}

/**
 * Fetch the plan_limits row for a given plan tier.
 */
export async function getPlanLimits(plan: string): Promise<PlanLimits | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .eq('plan', plan)
    .single()

  if (error || !data) return null
  return data as PlanLimits
}

/**
 * Check if the user can parse another resume this month.
 */
export async function canParse(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, monthly_parse_count')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const limits = await getPlanLimits(profile.plan)
  if (!limits) return { allowed: false, remaining: 0 }

  const remaining = limits.monthly_parse_limit - profile.monthly_parse_count
  return {
    allowed: remaining > 0,
    remaining: Math.max(remaining, 0),
  }
}

/**
 * Check if the user can publish another resume.
 */
export async function canPublishResume(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, public_resume_count')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const limits = await getPlanLimits(profile.plan)
  if (!limits) return { allowed: false, remaining: 0 }

  const remaining = limits.public_resume_limit - profile.public_resume_count
  return {
    allowed: remaining > 0,
    remaining: Math.max(remaining, 0),
  }
}

/**
 * Check if a specific parser mode is enabled for the user's plan.
 */
export async function isParserModeAllowed(userId: string, mode: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  if (!profile) return false

  const limits = await getPlanLimits(profile.plan)
  if (!limits) return false

  switch (mode) {
    case 'deep':
      return limits.nano_pro_enabled
    case 'auto':
      return limits.auto_enabled
    case 'fast':
    case 'agentic':
      return true
    default:
      return false
  }
}

/**
 * Check if a user has enough credits for a given cost.
 */
export async function hasEnoughCredits(userId: string, cost: number): Promise<{ allowed: boolean; balance: number }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, balance: 0 }

  return {
    allowed: profile.credits_balance >= cost,
    balance: profile.credits_balance,
  }
}
