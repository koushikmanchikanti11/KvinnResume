import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCreditCost, CreditFeature } from "@/lib/credits/pricing"
import { z } from "zod"

const EstimateRequestSchema = z.object({
  feature: z.string(),
  context_length: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = EstimateRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { feature } = parsed.data

    // Get cost
    let cost = 0
    try {
      cost = getCreditCost(feature as CreditFeature)
      if (cost === undefined) {
        throw new Error("Invalid feature")
      }
    } catch {
      return NextResponse.json({ error: "Invalid feature requested" }, { status: 400 })
    }

    // Get user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single()

    const currentBalance = profile?.credits_balance || 0

    return NextResponse.json({
      credit_cost: cost,
      current_balance: currentBalance,
      can_afford: currentBalance >= cost,
    })
  } catch (error) {
    console.error("[tokens/estimate] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}