/**
 * KvinnResume — Pricing & Plan Configuration
 * 
 * Defines credit costs for each feature, plan tiers, and credit packages.
 * All costs are in "credits" (1 credit = smallest billable unit).
 */

// ── Credit Costs Per Feature ──────────────────────────────
export const CREDIT_COSTS = {
  parse_nano: 7,
  parse_nano_mini: 10,
  parse_nano_pro: 20,
  parse_auto_max_reserve: 20,
  ai_grammar_fix: 1,
  ai_resume_chat: 1,
  ai_rewrite_section: 2,
  ai_generate_bullets: 2,
  ai_improve_summary: 2,
  ai_ats_optimization: 3,
  ai_full_resume_improvement: 5,
  ai_cover_letter: 5,
} as const

export type CreditFeature = keyof typeof CREDIT_COSTS

// ── Plan Tiers ────────────────────────────────────────────
export const PLAN_TIERS = {
  free: {
    label: 'Free',
    monthly_parse_limit: 5,
    public_resume_limit: 1,
    monthly_ai_credit_limit: null, // unlimited within balance
    nano_pro_enabled: false,
    auto_enabled: false,
    cover_letter_enabled: false,
    signup_credits: 50,
  },
  pro: {
    label: 'Pro',
    monthly_parse_limit: 50,
    public_resume_limit: 5,
    monthly_ai_credit_limit: null,
    nano_pro_enabled: true,
    auto_enabled: true,
    cover_letter_enabled: true,
    signup_credits: 50,
  },
  premium: {
    label: 'Premium',
    monthly_parse_limit: 2147483647, // unlimited
    public_resume_limit: 2147483647,
    monthly_ai_credit_limit: null,
    nano_pro_enabled: true,
    auto_enabled: true,
    cover_letter_enabled: true,
    signup_credits: 50,
  },
} as const

export type PlanTier = keyof typeof PLAN_TIERS

// ── Credit Packages (matches credit_packages table seed) ──
export const CREDIT_PACKAGES = [
  { name: 'Starter Pack', credits: 100, price_inr: 9900, price_display: '₹99' },
  { name: 'Builder Pack', credits: 300, price_inr: 24900, price_display: '₹249' },
  { name: 'Pro Pack', credits: 700, price_inr: 49900, price_display: '₹499' },
] as const

/**
 * Get the credit cost for a given feature.
 */
export function getCreditCost(feature: CreditFeature): number {
  return CREDIT_COSTS[feature]
}

/**
 * Get the plan config for a given tier.
 */
export function getPlanConfig(plan: string) {
  return PLAN_TIERS[plan as PlanTier] ?? PLAN_TIERS.free
}
