"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FileUp, Plus } from "lucide-react";

interface DashboardHeroProps {
  userId: string;
  userName?: string | null;
  onUploadClick?: () => void;
  onNewResumeClick?: () => void;
}

interface ProfileRow {
  full_name: string | null;
  email: string | null;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(value?: string | null) {
  if (!value) return "there";

  const trimmed = value.trim();

  if (!trimmed) return "there";

  if (trimmed.includes("@")) {
    return trimmed.split("@")[0] || "there";
  }

  return trimmed.split(" ")[0] || "there";
}

export function DashboardHero({
  userId,
  userName,
  onUploadClick,
  onNewResumeClick,
}: DashboardHeroProps) {
  const [profileName, setProfileName] = useState<string | null>(userName ?? null);
  const [loading, setLoading] = useState(!userName);

  useEffect(() => {
    if (userName) {
      setProfileName(userName);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchProfile() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch dashboard profile:", error.message);
        setProfileName(null);
      } else {
        const profile = (data as ProfileRow | null) ?? null;
        setProfileName(profile?.full_name || profile?.email || null);
      }

      setLoading(false);
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [userId, userName]);

  const greeting = useMemo(() => getGreeting(), []);
  const displayName = getFirstName(profileName);

  return (
    <section
      className="w-full min-w-0"
      style={{
        padding: "24px 0",
      }}
    >
      <div className="flex min-w-0 items-start justify-between gap-5 max-md:flex-col">
        <div className="min-w-0 flex-1">
          <div
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "#454647",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            DASHBOARD
          </div>

          {loading ? (
            <div
              className="animate-pulse"
              style={{
                width: "260px",
                maxWidth: "100%",
                height: "34px",
                background: "#111214",
                borderRadius: "6px",
              }}
            />
          ) : (
            <h1
              className="truncate"
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              {greeting}, {displayName}.
            </h1>
          )}

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#6a6b6c",
            }}
          >
            Track your resumes, parsing jobs, credits, and AI improvements from one workspace.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 max-md:w-full">
          {onUploadClick ? (
            <button
              type="button"
              onClick={onUploadClick}
              className="inline-flex items-center justify-center gap-[6px] max-md:flex-1"
              style={{
                height: "34px",
                padding: "0 14px",
                background: "#e6e6e6",
                color: "#2f3031",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow:
                  "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "transform 160ms ease, box-shadow 160ms ease",
              }}
              onMouseDown={(event) => {
                event.currentTarget.style.transform = "translateY(1px)";
                event.currentTarget.style.boxShadow =
                  "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
              onMouseUp={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
            >
              <FileUp size={14} />
              Upload
            </button>
          ) : (
            <Link
              href="/files"
              className="inline-flex items-center justify-center gap-[6px] max-md:flex-1"
              style={{
                height: "34px",
                padding: "0 14px",
                background: "#e6e6e6",
                color: "#2f3031",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                boxShadow:
                  "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "transform 160ms ease, box-shadow 160ms ease",
              }}
            >
              <FileUp size={14} />
              Upload
            </Link>
          )}

          {onNewResumeClick ? (
            <button
              type="button"
              onClick={onNewResumeClick}
              className="inline-flex items-center justify-center gap-[6px] max-md:flex-1"
              style={{
                height: "34px",
                padding: "0 14px",
                background: "transparent",
                color: "#9c9c9d",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 160ms ease, color 160ms ease, background 160ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
                event.currentTarget.style.color = "#f3f3f3";
                event.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                event.currentTarget.style.color = "#9c9c9d";
                event.currentTarget.style.background = "transparent";
              }}
            >
              <Plus size={14} />
              New Resume
            </button>
          ) : (
            <Link
              href="/resume/new"
              className="inline-flex items-center justify-center gap-[6px] max-md:flex-1"
              style={{
                height: "34px",
                padding: "0 14px",
                background: "transparent",
                color: "#9c9c9d",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                transition: "border-color 160ms ease, color 160ms ease, background 160ms ease",
              }}
            >
              <Plus size={14} />
              New Resume
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;