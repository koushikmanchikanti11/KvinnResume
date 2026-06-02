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

function getDayLabel(index: number) {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index));

  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export function ResumeAnalyticsCard({
  userId,
  onViewFull,
}: ResumeAnalyticsCardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
        minHeight: "280px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
        transition: "border-color 160ms ease, transform 160ms ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div className="mb-[16px] flex items-center justify-between gap-3">
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
              transition: "color 160ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = "#e7c59a";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = "#6a6b6c";
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
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="mb-[12px] flex items-center justify-between gap-3">
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
              className="flex h-[140px] items-end gap-[8px]"
              style={{
                padding: "14px 12px 10px",
                background: "#1b1c1e",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
              }}
            >
              {recentActivity.map((value, index) => {
                const percentage = getActivityPercentage(value, maxActivity);
                const hovered = hoveredBar === index;

                return (
                  <div
                    key={`${value}-${index}`}
                    className="relative flex min-w-0 flex-1 flex-col items-center gap-[7px]"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{
                      cursor: "default",
                    }}
                  >
                    {hovered && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 8px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 20,
                          whiteSpace: "nowrap",
                          background: "#1b1c1e",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: "6px",
                          padding: "5px 8px",
                          fontFamily:
                            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                          fontSize: "11px",
                          color: "#f3f3f3",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                          pointerEvents: "none",
                        }}
                      >
                        {value} {value === 1 ? "upload" : "uploads"}
                      </div>
                    )}

                    <div
                      style={{
                        width: "100%",
                        height: "100px",
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
                          opacity: hovered ? 1 : 0.78,
                          filter: hovered
                            ? "brightness(1.18)"
                            : "brightness(1)",
                          border: hovered
                            ? "1px solid rgba(255,255,255,0.16)"
                            : "1px solid transparent",
                          transition:
                            "height 300ms ease, opacity 160ms ease, filter 160ms ease, border-color 160ms ease",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontFamily:
                          "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                        fontSize: "9px",
                        color: hovered ? "#9c9c9d" : "#454647",
                        transition: "color 160ms ease",
                      }}
                    >
                      {getDayLabel(index)}
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
    <div className="flex flex-col items-center justify-center py-10 text-center">
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
        minHeight: "280px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[16px] flex items-center justify-between">
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
          marginTop: "18px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <SkeletonBlock width="96px" height="10px" />

        <div
          className="mt-[12px] flex h-[140px] items-end gap-[8px]"
          style={{
            padding: "14px 12px 10px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
          }}
        >
          {[45, 70, 35, 80, 55, 90, 62].map((height, index) => (
            <div
              key={index}
              className="flex flex-1 items-end"
              style={{ height: "100px" }}
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