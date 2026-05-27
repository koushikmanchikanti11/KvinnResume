import { NextResponse } from 'next/server'
import { deductCredits } from '@/lib/credits/credit-service'
import { CREDIT_COSTS, type CreditFeature } from '@/lib/credits/pricing'
import { INSUFFICIENT_CREDITS_ERROR } from '@/lib/credits/plan-checker'

/**
 * POST /api/credits/deduct
 *
 * Internal-only endpoint to deduct credits from a user.
 * Protected by INTERNAL_API_SECRET — only called by other backend services.
 *
 * Body:
 *   - user_id: string (required)
 *   - feature: CreditFeature (required)
 *   - related_entity_type?: string
 *   - related_entity_id?: string
 *   - metadata?: Record<string, unknown>
 */
export async function POST(request: Request) {
  // Validate internal secret
  const authHeader = request.headers.get('x-internal-secret')
  if (authHeader !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Invalid or missing internal API secret' } },
      { status: 401 }
    )
  }

  let body: {
    user_id?: string
    feature?: string
    related_entity_type?: string
    related_entity_id?: string
    metadata?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'invalid_body', message: 'Request body must be valid JSON' } },
      { status: 400 }
    )
  }

  const { user_id, feature, related_entity_type, related_entity_id, metadata } = body

  // Validate required fields
  if (!user_id || !feature) {
    return NextResponse.json(
      { error: { code: 'missing_fields', message: 'user_id and feature are required' } },
      { status: 400 }
    )
  }

  // Validate feature is a known credit feature
  if (!(feature in CREDIT_COSTS)) {
    return NextResponse.json(
      { error: { code: 'invalid_feature', message: `Unknown feature: ${feature}` } },
      { status: 400 }
    )
  }

  try {
    const result = await deductCredits(
      user_id,
      feature as CreditFeature,
      related_entity_type,
      related_entity_id,
      metadata
    )

    return NextResponse.json({
      success: true,
      new_balance: result.new_balance,
      credits_deducted: CREDIT_COSTS[feature as CreditFeature],
      feature,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message === 'insufficient_credits') {
      return NextResponse.json(
        { error: INSUFFICIENT_CREDITS_ERROR },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: { code: 'deduction_failed', message } },
      { status: 500 }
    )
  }
}
