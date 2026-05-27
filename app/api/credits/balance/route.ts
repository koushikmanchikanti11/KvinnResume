import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/credits/credit-service'
import { getPlanLimits } from '@/lib/credits/plan-checker'

/**
 * GET /api/credits/balance
 *
 * Returns the authenticated user's credit balance, plan info,
 * usage counts, and plan limits.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const balance = await getBalance(user.id)

  if (!balance) {
    return NextResponse.json(
      { error: { code: 'profile_not_found', message: 'User profile not found' } },
      { status: 404 }
    )
  }

  // Fetch plan limits for the user's plan
  const limits = await getPlanLimits(balance.plan)

  return NextResponse.json({
    credits_balance: balance.credits_balance,
    plan: balance.plan,
    monthly_parse_count: balance.monthly_parse_count,
    monthly_ai_credits_used: balance.monthly_ai_credits_used,
    public_resume_count: balance.public_resume_count,
    billing_cycle_start: balance.billing_cycle_start,
    billing_cycle_end: balance.billing_cycle_end,
    limits: limits
      ? {
          monthly_parse_limit: limits.monthly_parse_limit,
          public_resume_limit: limits.public_resume_limit,
          nano_pro_enabled: limits.nano_pro_enabled,
          auto_enabled: limits.auto_enabled,
          cover_letter_enabled: limits.cover_letter_enabled,
        }
      : null,
  })
}
