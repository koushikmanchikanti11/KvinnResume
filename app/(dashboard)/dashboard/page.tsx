import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { ActiveResumeCard } from "@/components/dashboard/active-resume-card";
import { CreditsUsageCard } from "@/components/dashboard/credits-usage-card";
import { RecentFilesCard } from "@/components/dashboard/recent-files-card";
import { ATSScoreCard } from "@/components/dashboard/ats-score-card";
import { ParseQueueCard } from "@/components/dashboard/parse-queue-card";
import { AISuggestionsCard } from "@/components/dashboard/ai-suggestions-card";

/**
 * Dashboard Grid from design doc (Section 7):
 * ┌────────────────────┬────────────────────┬────────────────────┐
 * │ Active Resume       │ ATS Score           │ Credits             │
 * ├────────────────────┼────────────────────┼────────────────────┤
 * │ Recent Files        │ Parse Queue         │ AI Suggestions      │
 * └────────────────────┴────────────────────┴────────────────────┘
 */
export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Hero + Quick Actions */}
      <DashboardHero />
      <QuickActionsCard />

      {/* Row 1: Active Resume | ATS Score | Credits */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
        className="dashboard-grid-row"
      >
        <ActiveResumeCard />
        <ATSScoreCard />
        <CreditsUsageCard />
      </div>

      {/* Row 2: Recent Files | Parse Queue | AI Suggestions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
        className="dashboard-grid-row"
      >
        <RecentFilesCard />
        <ParseQueueCard />
        <AISuggestionsCard />
      </div>
    </div>
  );
}
