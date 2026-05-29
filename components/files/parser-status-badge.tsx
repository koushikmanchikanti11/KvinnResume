import { cn } from "@/lib/utils";

export type ParserStatus =
  | "idle"
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

type ParserStatusBadgeProps = {
  status?: ParserStatus | string | null;
  className?: string;
};

function normalizeStatus(status?: string | null): ParserStatus {
  const value = String(status || "idle").toLowerCase();

  if (value === "queued" || value === "uploading") return "pending";
  if (value === "parsing" || value === "structuring" || value === "enhancing") {
    return "running";
  }
  if (value === "parsed" || value === "ready" || value === "success") {
    return "completed";
  }
  if (value === "error") return "failed";

  if (
    value === "idle" ||
    value === "pending" ||
    value === "running" ||
    value === "completed" ||
    value === "failed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "idle";
}

const config: Record<
  ParserStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  idle: {
    label: "Idle",
    className: "border-white/10 bg-white/[0.03] text-kv-text-muted",
    dot: "bg-kv-text-muted",
  },
  pending: {
    label: "Pending",
    className: "border-kv-accent-amber/35 bg-kv-accent-amber/10 text-kv-accent-amber",
    dot: "bg-kv-accent-amber animate-pulse",
  },
  running: {
    label: "Running",
    className: "border-kv-accent-blue/35 bg-kv-accent-blue/10 text-kv-accent-blue",
    dot: "bg-kv-accent-blue animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "border-kv-accent-green/35 bg-kv-accent-green/10 text-kv-accent-green",
    dot: "bg-kv-accent-green",
  },
  failed: {
    label: "Failed",
    className: "border-kv-accent-red/35 bg-kv-accent-red/10 text-[#ff8c8c]",
    dot: "bg-kv-accent-red",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-white/10 bg-white/[0.03] text-kv-text-muted",
    dot: "bg-kv-text-disabled",
  },
};

export function ParserStatusBadge({
  status,
  className,
}: ParserStatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const item = config[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1",
        "font-jetbrains text-[10px] font-medium uppercase tracking-[0.12em]",
        item.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
}