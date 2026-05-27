import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLedger } from '@/lib/credits/credit-service'

/**
 * GET /api/credits/ledger
 *
 * Returns the authenticated user's credit transaction history
 * with pagination support.
 *
 * Query params:
 *   - limit: number (default 20, max 100)
 *   - offset: number (default 0)
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 1), 100)
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0)

  const { entries, total } = await getLedger(user.id, { limit, offset })

  return NextResponse.json({
    entries,
    total,
    limit,
    offset,
    has_more: offset + entries.length < total,
  })
}
