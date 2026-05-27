/**
 * KvinnResume — Credit Service
 *
 * Server-side service for reading balance, ledger history,
 * and deducting credits using the Supabase RPC functions.
 */

import { createClient } from '@/lib/supabase/server'
import { type CreditFeature, getCreditCost } from './pricing'

// ── Types ─────────────────────────────────────────────────

export interface CreditBalance {
  credits_balance: number
  plan: string
  monthly_parse_count: number
  monthly_ai_credits_used: number
  public_resume_count: number
  billing_cycle_start: string | null
  billing_cycle_end: string | null
}

export interface LedgerEntry {
  id: string
  amount: number
  balance_after: number
  reason: string
  related_entity_type: string | null
  related_entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Read Functions ────────────────────────────────────────

/**
 * Get the full credit balance and plan info for a user.
 */
export async function getBalance(userId: string): Promise<CreditBalance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'credits_balance, plan, monthly_parse_count, monthly_ai_credits_used, public_resume_count, billing_cycle_start, billing_cycle_end'
    )
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as CreditBalance
}

/**
 * Get paginated ledger history for a user.
 */
export async function getLedger(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ entries: LedgerEntry[]; total: number }> {
  const supabase = await createClient()
  const limit = options.limit ?? 20
  const offset = options.offset ?? 0

  const { data, error, count } = await supabase
    .from('credits_ledger')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return { entries: [], total: 0 }

  return {
    entries: (data ?? []) as LedgerEntry[],
    total: count ?? 0,
  }
}

// ── Write Functions ───────────────────────────────────────

/**
 * Deduct credits from a user using the Supabase RPC function.
 * Returns the new balance, or throws on insufficient credits.
 */
export async function deductCredits(
  userId: string,
  feature: CreditFeature,
  relatedEntityType?: string,
  relatedEntityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ new_balance: number }> {
  const supabase = await createClient()
  const cost = getCreditCost(feature)

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_reason: feature,
    p_related_entity_type: relatedEntityType ?? null,
    p_related_entity_id: relatedEntityId ?? null,
    p_metadata: metadata ?? null,
  })

  if (error) {
    if (error.message?.includes('insufficient_credits')) {
      throw new Error('insufficient_credits')
    }
    throw error
  }

  return { new_balance: data as number }
}

/**
 * Add credits to a user using the Supabase RPC function.
 * Returns the new balance.
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  metadata?: Record<string, unknown>
): Promise<{ new_balance: number }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_related_entity_type: relatedEntityType ?? null,
    p_related_entity_id: relatedEntityId ?? null,
    p_metadata: metadata ?? null,
  })

  if (error) throw error

  return { new_balance: data as number }
}

/**
 * Increment the monthly parse count for a user.
 */
export async function incrementParseCount(userId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({
      monthly_parse_count: await supabase
        .from('profiles')
        .select('monthly_parse_count')
        .eq('id', userId)
        .single()
        .then(({ data }) => (data?.monthly_parse_count ?? 0) + 1),
    })
    .eq('id', userId)
}
