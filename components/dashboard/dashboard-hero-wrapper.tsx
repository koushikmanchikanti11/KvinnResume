"use client";

import { useRouter } from "next/navigation";
import { DashboardHero } from "./dashboard-hero";

interface DashboardHeroWrapperProps {
  user: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export function DashboardHeroWrapper({ user }: DashboardHeroWrapperProps) {
  const router = useRouter();

  return (
    <DashboardHero
      userId={user.id}
      userName={user.full_name || user.email}
      onUploadClick={() => router.push("/files")}
      onNewResumeClick={() => router.push("/editor/new")}
    />
  );
}

export default DashboardHeroWrapper;