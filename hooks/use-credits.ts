import { useQuery } from "@tanstack/react-query";
import { useUser } from "./use-user";

export interface PlanLimits {
  monthly_parse_limit: number;
  public_resume_limit: number;
  nano_pro_enabled: boolean;
  auto_enabled: boolean;
  cover_letter_enabled: boolean;
}

export interface CreditBalance {
  credits_balance: number;
  plan: string;
  monthly_parse_count: number;
  monthly_ai_credits_used: number;
  public_resume_count: number;
  billing_cycle_start: string | null;
  billing_cycle_end: string | null;
  limits: PlanLimits | null;
}

export function useCredits() {
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery<CreditBalance>({
    queryKey: ["credits", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/credits/balance");
      if (!res.ok) {
        throw new Error("Failed to fetch credits");
      }
      return res.json();
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Cache for 30 seconds as per design doc
  });

  return { credits: data, loading: isLoading, error, refetch };
}
