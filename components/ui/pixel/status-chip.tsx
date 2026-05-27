import { cn } from "@/lib/utils";

type StatusType = "published" | "draft" | "error" | "success" | "neutral" | "warning";

export function StatusChip({
  status,
  label,
  className,
}: {
  status: StatusType;
  label: string;
  className?: string;
}) {
  const getColors = () => {
    switch (status) {
      case "published":
      case "success":
        return "text-kv-accent-green bg-[rgba(0,172,92,0.1)] border-[rgba(0,172,92,0.2)]";
      case "error":
        return "text-kv-accent-red bg-[rgba(255,99,99,0.1)] border-[rgba(255,99,99,0.2)]";
      case "warning":
        return "text-kv-accent-amber bg-[rgba(231,197,154,0.1)] border-[rgba(231,197,154,0.2)]";
      case "draft":
      case "neutral":
      default:
        return "text-kv-text-secondary bg-kv-surface-2 border-kv-border-soft";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-jetbrains border",
        getColors(),
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "published" || status === "success" ? "bg-kv-accent-green" :
          status === "error" ? "bg-kv-accent-red" :
          status === "warning" ? "bg-kv-accent-amber" :
          "bg-kv-text-muted"
        )}
      />
      {label}
    </span>
  );
}
