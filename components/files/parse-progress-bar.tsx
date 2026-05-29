import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type ParseProgressBarProps = {
  status?: "idle" | "pending" | "running" | "parsing_complete" | "completed" | "failed" | "cancelled" | string | null;
  progress?: number | null;
  className?: string;
  label?: string;
  onCancel?: () => void;
};

function getProgressFromStatus(status?: string | null) {
  switch (String(status || "").toLowerCase()) {
    case "uploaded":
    case "idle":
      return 10;
    case "queued":
    case "pending":
      return 25;
    case "parsing":
    case "running":
      return 55;
    case "structuring":
    case "parsing_complete":
      return 76;
    case "enhancing":
      return 88;
    case "parsed":
    case "completed":
      return 100;
    case "failed":
    case "cancelled":
      return 100;
    default:
      return 0;
  }
}

export function ParseProgressBar({
  status,
  progress,
  className,
  label,
  onCancel,
}: ParseProgressBarProps) {
  const normalizedStatus = String(status || "").toLowerCase();
  
  if (normalizedStatus === "idle") return null;

  const value =
    typeof progress === "number"
      ? Math.max(0, Math.min(100, progress))
      : getProgressFromStatus(status);

  const failed = normalizedStatus === "failed";
  const completed =
    normalizedStatus === "completed" || normalizedStatus === "parsed";
  const isActive = !failed && !completed && normalizedStatus !== "idle";

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between font-jetbrains text-[10px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3">
          <span className="text-kv-text-disabled">{label || "Parse Progress"}</span>
          {isActive && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-kv-text-muted hover:text-kv-accent-red transition-colors"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          )}
        </div>
        <span
          className={cn(
            failed
              ? "text-kv-accent-red"
              : completed
                ? "text-kv-accent-green"
                : "text-kv-accent-blue"
          )}
        >
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-[3px] border border-white/[0.04] bg-white/[0.05]">
        <div
          className={cn(
            "h-full transition-all duration-500",
            failed
              ? "bg-kv-accent-red"
              : completed
                ? "bg-kv-accent-green"
                : "bg-kv-accent-blue"
          )}
          style={{ width: `${value}%` }}
        />
      </div>

      {completed && (
        <p className="mt-2 font-jetbrains text-[10px] text-kv-accent-green uppercase tracking-[0.12em]">
          Redirecting to editor...
        </p>
      )}

      {failed && (
        <p className="mt-2 font-jetbrains text-[10px] text-kv-accent-red uppercase tracking-[0.12em]">
          Try again...
        </p>
      )}
    </div>
  );
}
