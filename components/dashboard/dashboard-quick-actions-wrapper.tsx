"use client";

import { useRouter } from "next/navigation";
import QuickActionsCard from "./quick-actions-card";

export function DashboardQuickActionsWrapper() {
  const router = useRouter();

  return (
    <QuickActionsCard
      onUpload={() => router.push("/files")}
      onNewResume={() => router.push("/editor/new")}
      onAIChat={() => router.push("/ai-chat")}
      onPublish={() => router.push("/resume")}
      onDownloadPDF={() => router.push("/resume")}
      onViewAnalytics={() => router.push("/analytics")}
    />
  );
}

export default DashboardQuickActionsWrapper;