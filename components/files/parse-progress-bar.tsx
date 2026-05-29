"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParserStatus } from "./parser-status-badge";
import { ParserStatusBadge } from "./parser-status-badge";

type ParseProgressBarProps = {
  status: ParserStatus;
  progress: number;
  label?: string;
  error?: string | null;
  onTryAgain?: () => void;
  className?: string;
};

const progressColor: Record<ParserStatus, string> = {
  idle: "bg-kv-text-muted",
  pending: "bg-kv-accent-amber",
  running: "bg-kv-accent-blue",
  completed: "bg-kv-accent-green",
  failed: "bg-kv-accent-red",
  cancelled: "bg-kv-text-disabled",
};

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

export function ParseProgressBar({
  status,
  progress,
  label,
  error,
  onTryAgain,
  className,
}: ParseProgressBarProps) {
  const value = clampProgress(progress);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-kv-surface-2 p-4",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
            Parse Progress
          </p>

          <p className="mt-1 text-[14px] font-medium text-kv-text-primary">
            {label ||
              (status === "completed"
                ? "Completed. Redirecting to editor..."
                : status === "failed"
                  ? "Parsing failed"
                  : status === "running"
                    ? "Parsing your resume..."
                    : status === "pending"
                      ? "Preparing parser..."
                      : "Waiting to start")}
          </p>
        </div>

        <ParserStatusBadge status={status} />
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-md border border-white/[0.04] bg-white/[0.06]">
        <div
          className={cn("h-full transition-all duration-500", progressColor[status])}
          style={{ width: `${value}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-jetbrains text-[10px] uppercase tracking-[0.12em]">
        <span className="text-kv-text-disabled">Live indicator</span>
        <span
          className={cn(
            status === "failed"
              ? "text-kv-accent-red"
              : status === "completed"
                ? "text-kv-accent-green"
                : "text-kv-accent-blue"
          )}
        >
          {value}%
        </span>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-kv-accent-red/25 bg-kv-accent-red/10 p-3 text-[13px] leading-5 text-[#ff8c8c]">
          {error}
        </p>
      ) : null}

      {status === "failed" && onTryAgain ? (
        <button
          type="button"
          onClick={onTryAgain}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-kv-surface-3 px-3 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-kv-text-primary transition hover:bg-kv-surface-4 max-sm:w-full"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </button>
      ) : null}
    </div>
  );
}