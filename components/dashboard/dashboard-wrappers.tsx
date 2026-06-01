"use client";

import { useRouter } from "next/navigation";

import ActiveResumeCard from "./active-resume-card";
import { ATSScoreCard } from "./ats-score-card";
import { CreditsUsageCard } from "./credits-usage-card";
import { RecentFilesCard } from "./recent-files-card";
import { ParseQueueCard } from "./parse-queue-card";
import { AISuggestionsCard } from "./ai-suggestions-card";
import { ResumeAnalyticsCard } from "./resume-analytics-card";

export function DashboardActiveResumeWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <ActiveResumeCard
      userId={userId}
      onUploadClick={() => router.push("/files")}
      onDelete={async (resumeId) => {
        try {
          await fetch(`/api/resumes/${resumeId}`, {
            method: "DELETE",
          });

          router.refresh();
        } catch (error) {
          console.error("Failed to delete resume:", error);
        }
      }}
    />
  );
}

export function DashboardATSScoreWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <ATSScoreCard
      userId={userId}
      onImprove={() => router.push("/ai-chat")}
    />
  );
}

export function DashboardCreditsUsageWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <CreditsUsageCard
      userId={userId}
      onBuyCredits={() => router.push("/billing")}
      onViewUsage={() => router.push("/billing/usage")}
    />
  );
}

export function DashboardRecentFilesWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <RecentFilesCard
      userId={userId}
      onViewAll={() => router.push("/files")}
      onReParse={async (fileId) => {
        try {
          await fetch("/api/parse/start", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileId,
              mode: "nano",
            }),
          });

          router.refresh();
        } catch (error) {
          console.error("Failed to re-parse file:", error);
        }
      }}
    />
  );
}

export function DashboardParseQueueWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <ParseQueueCard
      userId={userId}
      onRetry={async (fileId) => {
        try {
          await fetch("/api/parse/start", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileId,
              mode: "nano",
            }),
          });

          router.refresh();
        } catch (error) {
          console.error("Failed to retry parse:", error);
        }
      }}
      onCancel={async (jobId) => {
        try {
          await fetch(`/api/parse/cancel/${jobId}`, {
            method: "POST",
          });

          router.refresh();
        } catch (error) {
          console.error("Failed to cancel parse job:", error);
        }
      }}
    />
  );
}

export function DashboardAISuggestionsWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <AISuggestionsCard
      userId={userId}
      onSuggestionClick={(prompt) => {
        const searchParams = new URLSearchParams();

        if (prompt) {
          searchParams.set("prompt", prompt);
        }

        const query = searchParams.toString();
        router.push(query ? `/ai-chat?${query}` : "/ai-chat");
      }}
    />
  );
}

export function DashboardResumeAnalyticsWrapper({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();

  return (
    <ResumeAnalyticsCard
      userId={userId}
      onViewFull={() => router.push("/analytics")}
    />
  );
}