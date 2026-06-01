"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  BarChart2,
  ChevronRight,
  FileText,
  TrendingUp,
} from "lucide-react";

interface ResumeAnalyticsCardProps {
  userId: string;
  onViewFull?: () => void;
}

interface ResumeRow {
  id: string;
  ats_score: number | null;
  updated_at: string | null;
}

interface ResumeFileRow {
  id: string;
  parse_status: string;
  created_at: string;
}

interface AnalyticsStats {
  totalResumes: number;
  totalFiles: number;
  completedParses: number;
  avgAtsScore: number | null;
  recentActivity: number[];
}

function getScoreColor(score: number | null) {
  if (score === null) return "#454647";
  if (score >= 80) return "#00ac5c";
  if (score >= 60) return "#e7c59a";
  return "#ff6363";
}

function getTrendColor(value: number) {
  if (value >= 75) return "#00ac5c";
  if (value >= 45) return "#e7c59a";
  return "#56c2ff";
}

function getLast7DaysActivity(files: ResumeFileRow[]) {
  const today = new Date();
  const buckets = Array.from({ length: 7 }, () => 0);

  for (const file of files) {
    const createdAt = new Date(file.created_at);

    if (Number.isNaN(createdAt.getTime())) continue;

    const diffMs = today.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < 7) {
      const index = 6 - diffDays;
      buckets[index] += 1;
    }
  }

  return buckets;
}

function getActivityPercentage(value: number, max: number) {
  if (max <= 0) return 8;

  return Math.max(8, Math.round((value / max) * 100));
}

export function ResumeAnalyticsCard({
  userId,
  onViewFull,
}: ResumeAnalyticsCardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchAnalytics() {
      setLoading(true);

      const supabase = createClient();

      const { data: resumeRows, error: resumesError } = await supabase
        .from("resumes")
        .select("id, ats_score, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!mounted) return;

      if (resumesError) {
        console.error("Failed to fetch resume analytics:", resumesError.message);
        setStats(null);
        setLoading(false);
        return;
      }

      const { data: fileRows, error: filesError } = await supabase
        .from("resume_files")
        .select("id, parse_status, created_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!mounted) return;

      if (filesError) {
        console.error("Failed to fetch file analytics:", filesError.message);
      }

      const resumes = ((resumeRows ?? []) as ResumeRow[]).filter(Boolean);
      const files = ((fileRows ?? []) as ResumeFileRow[]).filter(Boolean);

      const atsScores = resumes
        .map((resume) => resume.ats_score)
        .filter((score): score is number => typeof score === "number");

      const avgAtsScore =
        atsScores.length > 0
          ? Math.round(
              atsScores.reduce((sum, score) => sum + score, 0) /
                atsScores.length
            )
          : null;

      const completedParses = files.filter(
        (file) => file.parse_status === "completed"
      ).length;

      setStats({
        totalResumes: resumes.length,
        totalFiles: files.length,
        completedParses,
        avgAtsScore,
        recentActivity: getLast7DaysActivity(files),
      });

      setLoading(false);
    }

    fetchAnalytics();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const maxActivity = useMemo(() => {
    if (!stats) return 0;

    return Math.max(...stats.recentActivity, 0);
  }, [stats]);

  if (loading) {
    return <ResumeAnalyticsSkeleton />;
  }

  const totalResumes = stats?.totalResumes ?? 0;
  const totalFiles = stats?.totalFiles ?? 0;
  const completedParses = stats?.completedParses ?? 0;
  const avgAtsScore = stats?.avgAtsScore ?? null;
  const recentActivity = stats?.recentActivity ?? [0, 0, 0, 0, 0, 0, 0];

  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between gap-3">
        <div
          style={{
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          RESUME ANALYTICS
        </div>

        {onViewFull && (
          <button
            type="button"
            onClick={onViewFull}
            className="inline-flex items-center gap-[4px]"
            style={{
              border: "none",
              background: "transparent",
              color: "#6a6b6c",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              padding: 0,
            }}
          >
            View full
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {totalResumes === 0 && totalFiles === 0 ? (
        <ResumeAnalyticsEmpty />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
            <MetricBox
              icon={<FileText size={14} />}
              label="RESUMES"
              value={String(totalResumes)}
              color="#56c2ff"
            />

            <MetricBox
              icon={<Activity size={14} />}
              label="PARSED"
              value={String(completedParses)}
              color="#00ac5c"
            />

            <MetricBox
              icon={<TrendingUp size={14} />}
              label="ATS AVG"
              value={avgAtsScore === null ? "—" : String(avgAtsScore)}
              color={getScoreColor(avgAtsScore)}
            />
          </div>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="mb-[10px] flex items-center justify-between gap-3">
              <span
                style={{
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  fontSize: "10px",
                  color: "#454647",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                7-DAY ACTIVITY
              </span>

              <span
                style={{
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "#6a6b6c",
                }}
              >
                {totalFiles} files
              </span>
            </div>

            <div
              className="flex h-[84px] items-end gap-[6px]"
              style={{
                padding: "10px",
                background: "#1b1c1e",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
              }}
            >
              {recentActivity.map((value, index) => {
                const percentage = getActivityPercentage(value, maxActivity);

                return (
                  <div
                    key={`${value}-${index}`}
                    className="flex min-w-0 flex-1 flex-col items-center gap-[5px]"
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "54px",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        title={`${value} uploads`}
                        style={{
                          width: "100%",
                          height: `${percentage}%`,
                          minHeight: "4px",
                          background: getTrendColor(percentage),
                          borderRadius: "4px 4px 2px 2px",
                          transition: "height 300ms ease",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontFamily:
                          "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                        fontSize: "9px",
                        color: "#454647",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MetricBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        minHeight: "62px",
        padding: "10px",
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
      }}
    >
      <div
        className="flex items-center gap-[6px]"
        style={{
          color: "#6a6b6c",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            color,
          }}
        >
          {icon}
        </span>

        <span
          style={{
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            fontSize: "10px",
            letterSpacing: "0.06em",
            color: "#454647",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          marginTop: "7px",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "18px",
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ResumeAnalyticsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <BarChart2 size={30} color="#454647" />

      <p
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "14px",
          fontWeight: 600,
          color: "#6a6b6c",
        }}
      >
        No analytics yet
      </p>

      <p
        style={{
          marginTop: "4px",
          marginBottom: 0,
          fontSize: "13px",
          color: "#454647",
        }}
      >
        Upload and parse resumes to see activity
      </p>
    </div>
  );
}

function ResumeAnalyticsSkeleton() {
  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between">
        <SkeletonBlock width="116px" height="10px" />
        <SkeletonBlock width="62px" height="12px" />
      </div>

      <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
        <SkeletonBlock width="100%" height="62px" radius="8px" />
        <SkeletonBlock width="100%" height="62px" radius="8px" />
        <SkeletonBlock width="100%" height="62px" radius="8px" />
      </div>

      <div
        style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <SkeletonBlock width="96px" height="10px" />

        <div
          className="mt-[10px] flex h-[84px] items-end gap-[6px]"
          style={{
            padding: "10px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
          }}
        >
          {[45, 70, 35, 80, 55, 90, 62].map((height, index) => (
            <div
              key={index}
              className="flex flex-1 items-end"
              style={{ height: "54px" }}
            >
              <div
                className="animate-pulse"
                style={{
                  width: "100%",
                  height: `${height}%`,
                  borderRadius: "4px 4px 2px 2px",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkeletonBlock({
  width,
  height,
  radius = "4px",
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#1b1c1e",
      }}
    />
  );
}

export default ResumeAnalyticsCard;