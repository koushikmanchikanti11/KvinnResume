"use client";

import { useUser } from "@/hooks/use-user";

export function DashboardHero() {
  const { user } = useUser();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ marginBottom: "8px" }}>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: "#ffffff",
          marginBottom: "6px",
        }}
        className="font-display"
      >
        {greeting}, {firstName}.
      </h1>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.5,
          color: "#9c9c9d",
        }}
      >
        Your resume workspace is ready.
      </p>
    </div>
  );
}
