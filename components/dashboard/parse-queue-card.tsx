"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Terminal,
  XCircle,
} from "lucide-react";

type ParseJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

interface ParseQueueCardProps {
  userId: string;
  onRetry?: (fileId: string) => void;
  onCancel?: (jobId: string) => void;
}

interface ParseJob {
  id: string;
  status: ParseJobStatus;
  parser_mode: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
  quality_score: number | null;
  pages_count: number | null;
  credits_used: number | null;
  resume_file_id?: string | null;
  file_id?: string | null;
}

function getModeName(mode: string | null) {
  switch (mode) {
    case "nano":
      return "Nano";
    case "nano_mini":
      return "Nano Mini";
    case "nano_pro":
      return "Nano Pro";
    case "auto":
      return "Auto";
    default:
      return "Auto";
  }
}

function isRunningStatus(status?: ParseJobStatus | null) {
  return status === "pending" || status === "running";
}

function isCompletedStatus(status?: ParseJobStatus | null) {
  return status === "completed";
}

function getStatusMeta(status: ParseJobStatus) {
  if (status === "pending") {
    return {
      label: "Pending",
      dot: "#e7c59a",
      text: "#9c9c9d",
      icon: Clock3,
    };
  }

  if (status === "running") {
    return {
      label: "Running",
      dot: "#e7c59a",
      text: "#9c9c9d",
      icon: Activity,
    };
  }

  if (isCompletedStatus(status)) {
    return {
      label: "Completed",
      dot: "#00ac5c",
      text: "#9c9c9d",
      icon: CheckCircle2,
    };
  }

  if (status === "failed") {
    return {
      label: "Failed",
      dot: "#ff6363",
      text: "#9c9c9d",
      icon: AlertCircle,
    };
  }

  return {
    label: "Cancelled",
    dot: "#6a6b6c",
    text: "#9c9c9d",
    icon: XCircle,
  };
}

function formatElapsed(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function ParseQueueCard({ userId, onRetry, onCancel }: ParseQueueCardProps) {
  const [job, setJob] = useState<ParseJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const running = isRunningStatus(job?.status);

  useEffect(() => {
    let mounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    async function fetchLatestJob() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("parse_jobs")
        .select(
          "id, status, parser_mode, provider, created_at, updated_at, error_message, quality_score, pages_count, credits_used, resume_file_id"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch parse queue:", error.message);
        setJob(null);
      } else {
        setJob((data as ParseJob | null) ?? null);
      }

      setLoading(false);
    }

    fetchLatestJob();

    if (running) {
      pollTimer = setInterval(fetchLatestJob, 3000);
    }

    return () => {
      mounted = false;

      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [userId, running]);

  useEffect(() => {
    if (!job || !running) {
      setElapsed(0);
      return;
    }

    const createdAt = new Date(job.created_at).getTime();

    if (Number.isNaN(createdAt)) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - createdAt) / 1000)));
    };

    tick();

    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [job, running]);

  const statusMeta = useMemo(() => {
    if (!job) return null;
    return getStatusMeta(job.status);
  }, [job]);

  if (loading) {
    return <ParseQueueSkeleton />;
  }

  if (!job || !statusMeta) {
    return <ParseQueueEmpty />;
  }

  const StatusIcon = statusMeta.icon;
  const isFailed = job.status === "failed";
  const completed = isCompletedStatus(job.status);
  const fileIdForRetry = job.resume_file_id || job.file_id || "";

  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: `1px solid ${running ? "rgba(86,194,255,0.3)" : "rgba(255,255,255,0.08)"
          }`,
        borderRadius: "10px",
        padding: "20px",
        transition: "border-color 400ms ease",
      }}
    >
      <style jsx>{`
        @keyframes parse-dot-pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes parse-slide {
          0% {
            left: -30%;
            width: 30%;
          }
          100% {
            left: 100%;
            width: 30%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .parse-animated {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="mb-[14px] flex items-center justify-between gap-3">
        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          PARSE QUEUE
        </span>

        <div
          className="inline-flex items-center gap-[5px]"
          style={{
            height: "22px",
            padding: "0 8px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
          }}
        >
          <span
            className={running ? "parse-animated" : undefined}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: statusMeta.dot,
              flexShrink: 0,
              animation: running ? "parse-dot-pulse 1.2s ease-in-out infinite" : undefined,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: "11px",
              fontWeight: 500,
              color: statusMeta.text,
            }}
          >
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <InfoChip>{getModeName(job.parser_mode)}</InfoChip>
      </div>

      {running && (
        <div
          className="relative mb-3 w-full overflow-hidden"
          style={{
            height: "3px",
            borderRadius: "2px",
            background: "#1b1c1e",
          }}
        >
          {job.status === "pending" ? (
            <div
              className="parse-animated"
              style={{
                width: "15%",
                height: "100%",
                borderRadius: "2px",
                background: "#e7c59a",
                animation: "parse-dot-pulse 1.4s ease-in-out infinite",
              }}
            />
          ) : (
            <div
              className="parse-animated absolute top-0 h-full"
              style={{
                borderRadius: "2px",
                background: "#56c2ff",
                animation: "parse-slide 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>
      )}

      <div
        className="mb-3 space-y-[6px]"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "12px",
          color: "#9c9c9d",
        }}
      >
        <TerminalLine
          icon={<StatusIcon size={13} />}
          text={
            running
              ? job.status === "pending"
                ? "Job queued. Waiting for parser worker..."
                : "Parsing resume and extracting structure..."
              : completed
                ? "Parse completed. Resume data is ready."
                : isFailed
                  ? "Parse failed. Review the error and retry."
                  : "Parse job was cancelled."
          }
        />

        {running && (
          <TerminalLine
            icon={<Clock3 size={13} />}
            text={`Elapsed time: ${formatElapsed(elapsed)}`}
          />
        )}

        {!running && (
          <TerminalLine
            icon={<Clock3 size={13} />}
            text={`Updated ${formatRelativeTime(job.updated_at)}`}
          />
        )}

        {isFailed && job.error_message && (
          <p
            style={{
              margin: 0,
              color: "#ff6363",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            $ error: {job.error_message}
          </p>
        )}
      </div>

      {completed && (
        <div
          className="grid grid-cols-3 gap-2 max-sm:grid-cols-1"
          style={{
            marginTop: "12px",
          }}
        >
          <MetricBox
            label="QUALITY"
            value={
              job.quality_score !== null && job.quality_score !== undefined
                ? `${job.quality_score}%`
                : "—"
            }
            valueColor={
              job.quality_score !== null && job.quality_score >= 80
                ? "#00ac5c"
                : job.quality_score !== null && job.quality_score >= 60
                  ? "#e7c59a"
                  : "#9c9c9d"
            }
          />

          <MetricBox
            label="PAGES"
            value={
              job.pages_count !== null && job.pages_count !== undefined
                ? job.pages_count.toString()
                : "—"
            }
          />

          <MetricBox
            label="CREDITS"
            value={
              job.credits_used !== null && job.credits_used !== undefined
                ? job.credits_used.toString()
                : "—"
            }
          />
        </div>
      )}

      {(isFailed || job.status === "cancelled") && (
        <div className="mt-3 flex flex-wrap gap-2">
          {isFailed && onRetry && fileIdForRetry && (
            <button
              type="button"
              onClick={() => onRetry(fileIdForRetry)}
              className="inline-flex items-center gap-[6px]"
              style={{
                height: "30px",
                padding: "0 10px",
                background: "transparent",
                border: "1px solid rgba(231,197,154,0.25)",
                borderRadius: "8px",
                color: "#e7c59a",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "var(--font-jetbrains), monospace",
                transition: "background 160ms ease, border-color 160ms ease",
              }}
            >
              <RefreshCw size={13} />
              Retry
            </button>
          )}
        </div>
      )}

      {running && onCancel && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onCancel(job.id)}
            className="inline-flex items-center gap-[6px]"
            style={{
              height: "30px",
              padding: "0 10px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#9c9c9d",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "var(--font-jetbrains), monospace",
              transition: "background 160ms ease, border-color 160ms ease",
            }}
          >
            <XCircle size={13} />
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}

function ParseQueueSkeleton() {
  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        minHeight: "120px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between">
        <SkeletonBlock width="100px" height="10px" />
        <SkeletonBlock width="74px" height="22px" />
      </div>

      <div className="mb-3 flex gap-2">
        <SkeletonBlock width="76px" height="22px" />
        <SkeletonBlock width="118px" height="22px" />
      </div>

      <SkeletonBlock width="100%" height="3px" marginBottom="12px" />
      <SkeletonBlock width="80%" height="12px" marginBottom="8px" />
      <SkeletonBlock width="55%" height="12px" />
    </section>
  );
}

function ParseQueueEmpty() {
  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        minHeight: "120px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="mb-[14px] flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          PARSE QUEUE
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Terminal size={24} color="#454647" />
        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#6a6b6c",
          }}
        >
          No active parse jobs
        </p>
        <p
          style={{
            marginTop: "3px",
            marginBottom: 0,
            fontSize: "12px",
            color: "#454647",
          }}
        >
          Upload a resume to start
        </p>
      </div>
    </section>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        height: "22px",
        padding: "0 8px",
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "6px",
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: "10px",
        color: "#9c9c9d",
      }}
    >
      {children}
    </span>
  );
}

function TerminalLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <p className="flex items-center gap-[7px]" style={{ margin: 0, lineHeight: 1.5 }}>
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ color: "#6a6b6c" }}
      >
        {icon}
      </span>
      <span className="min-w-0 truncate">$ {text}</span>
    </p>
  );
}

function MetricBox({
  label,
  value,
  valueColor = "#f3f3f3",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        minHeight: "52px",
        padding: "9px 10px",
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "10px",
          color: "#454647",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: "4px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "14px",
          fontWeight: 600,
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SkeletonBlock({
  width,
  height,
  marginBottom,
}: {
  width: string;
  height: string;
  marginBottom?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        marginBottom,
        background: "#1b1c1e",
        borderRadius: "4px",
      }}
    />
  );
}

export default ParseQueueCard;