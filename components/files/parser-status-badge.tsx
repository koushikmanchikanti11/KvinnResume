import { cn } from "@/lib/utils";

export type ParserStatus =
  | "not_started"
  | "unparsed"
  | "pending"
  | "running"
  | "parsing_complete"
  | "completed"
  | "failed";

type ParserStatusBadgeProps = {
  status?: ParserStatus | string | null;
  label?: string;
  className?: string;
};

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  not_started: {
    label: "Unparsed",
    className: "border-white/10 bg-white/[0.03] text-kv-text-secondary",
    dotClassName: "bg-kv-text-muted",
  },
  unparsed: {
    label: "Unparsed",
    className: "border-white/10 bg-white/[0.03] text-kv-text-secondary",
    dotClassName: "bg-kv-text-muted",
  },
  pending: {
    label: "Pending",
    className: "border-kv-accent-amber/30 bg-kv-accent-amber/10 text-kv-accent-amber",
    dotClassName: "bg-kv-accent-amber",
  },
  running: {
    label: "Parsing",
    className: "border-kv-accent-blue/30 bg-kv-accent-blue/10 text-kv-accent-blue",
    dotClassName: "bg-kv-accent-blue animate-pulse",
  },
  parsing_complete: {
    label: "Structuring AI",
    className: "border-kv-accent-violet/30 bg-kv-accent-violet/10 text-[#c8b6ff]",
    dotClassName: "bg-kv-accent-violet animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "border-kv-accent-green/30 bg-kv-accent-green/10 text-kv-accent-green",
    dotClassName: "bg-kv-accent-green",
  },
  failed: {
    label: "Failed",
    className: "border-kv-accent-red/30 bg-kv-accent-red/10 text-[#ff8c8c]",
    dotClassName: "bg-kv-accent-red",
  },
};

export function ParserStatusBadge({
  status,
  label,
  className,
}: ParserStatusBadgeProps) {
  const normalized = String(status || "not_started").toLowerCase();
  const config = statusConfig[normalized] ?? statusConfig.failed;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1",
        "font-jetbrains text-[10px] font-medium uppercase tracking-[0.12em]",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {label || config.label}
    </span>
  );
}
