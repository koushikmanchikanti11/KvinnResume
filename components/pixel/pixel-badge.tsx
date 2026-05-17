// TODO: Mono uppercase status badge (PARSED, AI_READY, ATS_SAFE, etc.)
import { cn } from "@/lib/utils";

interface PixelBadgeProps {
  label: string;
  variant?: "green" | "amber" | "blue" | "violet" | "red" | "orange";
  className?: string;
}

export function PixelBadge({ label, variant = "green", className }: PixelBadgeProps) {
  const variantStyles = {
    green: "bg-kr-green/10 text-kr-green border-kr-green/30",
    amber: "bg-kr-amber/10 text-kr-amber border-kr-amber/30",
    blue: "bg-kr-blue/10 text-kr-blue border-kr-blue/30",
    violet: "bg-kr-violet/10 text-kr-violet border-kr-violet/30",
    red: "bg-kr-red/10 text-kr-red border-kr-red/30",
    orange: "bg-kr-orange/10 text-kr-orange border-kr-orange/30",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 text-xs font-pixel tracking-widest uppercase border rounded-pixel",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
