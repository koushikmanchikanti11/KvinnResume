import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { DashboardHeroWrapper } from "@/components/dashboard/dashboard-hero-wrapper";
import { DashboardQuickActionsWrapper } from "@/components/dashboard/dashboard-quick-actions-wrapper";

import {
  DashboardActiveResumeWrapper,
  DashboardATSScoreWrapper,
  DashboardCreditsUsageWrapper,
  DashboardRecentFilesWrapper,
  DashboardAISuggestionsWrapper,
  DashboardResumeAnalyticsWrapper,
} from "@/components/dashboard/dashboard-wrappers";

export const metadata = {
  title: "Dashboard — KvinnResume",
};

function CardSkeleton({ minHeight = 160 }: { minHeight?: number }) {
  return (
    <div
      className="w-full min-w-0"
      style={{
        minHeight,
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        animation: "dashboard-card-pulse 1.4s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes dashboard-card-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, plan, credits_balance")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="w-full min-w-0 bg-[#040506]">
      <DashboardHeroWrapper
        user={{
          id: user.id,
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? user.email ?? "",
        }}
      />

      <div className="mt-6 grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_436px]">
        {/* Left Column */}
        <div className="flex min-w-0 flex-col gap-6">
          <Suspense fallback={<CardSkeleton minHeight={132} />}>
            <DashboardActiveResumeWrapper userId={user.id} />
          </Suspense>

          <Suspense fallback={<CardSkeleton minHeight={220} />}>
            <DashboardRecentFilesWrapper userId={user.id} />
          </Suspense>

          <Suspense fallback={<CardSkeleton minHeight={280} />}>
            <DashboardResumeAnalyticsWrapper userId={user.id} />
          </Suspense>

          <Suspense fallback={<CardSkeleton minHeight={220} />}>
            <DashboardAISuggestionsWrapper userId={user.id} />
          </Suspense>
        </div>

        {/* Right Column */}
        <div className="flex min-w-0 flex-col gap-6">
          <Suspense fallback={<CardSkeleton minHeight={230} />}>
            <DashboardATSScoreWrapper userId={user.id} />
          </Suspense>

          <Suspense fallback={<CardSkeleton minHeight={220} />}>
            <DashboardCreditsUsageWrapper userId={user.id} />
          </Suspense>

          <DashboardQuickActionsWrapper />
        </div>
      </div>
    </div>
  );
}