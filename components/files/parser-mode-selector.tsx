"use client";

import { cn } from "@/lib/utils";
import { Lock, Sparkles, Zap, ShieldCheck, Wand2 } from "lucide-react";

export type ParserMode = "nano" | "nano-mini" | "nano-pro" | "auto";

type ParserModeSelectorProps = {
  value: ParserMode;
  onChange: (value: ParserMode) => void;
  plan?: string | null;
  disabled?: boolean;
  className?: string;
};

const modes = [
  {
    value: "nano" as const,
    title: "Nano",
    subtitle: "Cost effective",
    provider: "LlamaParse",
    icon: Zap,
    accent: "text-kv-accent-green",
    border: "border-kv-accent-green/30",
    bg: "bg-kv-accent-green/10",
    freeAllowed: true,
  },
  {
    value: "nano-mini" as const,
    title: "Nano Mini",
    subtitle: "Agentic parsing",
    provider: "LlamaParse",
    icon: Sparkles,
    accent: "text-kv-accent-violet",
    border: "border-kv-accent-violet/30",
    bg: "bg-kv-accent-violet/10",
    freeAllowed: true,
  },
  {
    value: "nano-pro" as const,
    title: "Nano Pro",
    subtitle: "High accuracy",
    provider: "Reducto",
    icon: ShieldCheck,
    accent: "text-kv-accent-amber",
    border: "border-kv-accent-amber/30",
    bg: "bg-kv-accent-amber/10",
    freeAllowed: false,
  },
  {
    value: "auto" as const,
    title: "Auto",
    subtitle: "Fallback parser",
    provider: "Llama → Reducto",
    icon: Wand2,
    accent: "text-kv-accent-blue",
    border: "border-kv-accent-blue/30",
    bg: "bg-kv-accent-blue/10",
    freeAllowed: false,
  },
];

function isFreePlan(plan?: string | null) {
  return !plan || plan.toLowerCase() === "free";
}

export function ParserModeSelector({
  value,
  onChange,
  plan,
  disabled,
  className,
}: ParserModeSelectorProps) {
  const free = isFreePlan(plan);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
            Parser Mode
          </p>
          <p className="mt-1 text-[13px] text-kv-text-muted">
            Choose parser after upload. Default is Nano.
          </p>
        </div>

        <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-muted">
          {plan || "Free"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const locked = free && !mode.freeAllowed;
          const selected = value === mode.value;

          return (
            <button
              key={mode.value}
              type="button"
              disabled={disabled || locked}
              onClick={() => onChange(mode.value)}
              className={cn(
                "group relative min-h-[104px] rounded-xl border p-3 text-left transition-all",
                "bg-kv-surface-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)]",
                "hover:-translate-y-0.5 hover:bg-kv-surface-4",
                selected
                  ? cn(mode.border, mode.bg)
                  : "border-white/[0.08] hover:border-white/15",
                locked && "cursor-not-allowed opacity-50 hover:translate-y-0"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border",
                    selected ? mode.border : "border-white/10",
                    selected ? mode.bg : "bg-kv-surface-2"
                  )}
                >
                  <Icon className={cn("h-4 w-4", mode.accent)} />
                </span>

                {locked ? (
                  <Lock className="h-3.5 w-3.5 text-kv-text-disabled" />
                ) : selected ? (
                  <span className={cn("h-2 w-2 rounded-full", mode.accent.replace("text-", "bg-"))} />
                ) : null}
              </div>

              <div className="mt-3">
                <p className="text-[14px] font-semibold text-kv-text-primary">
                  {mode.title}
                </p>
                <p className="mt-1 text-[12px] text-kv-text-muted">
                  {mode.subtitle}
                </p>
                <p className="mt-2 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
                  {mode.provider}
                </p>
              </div>

              {locked ? (
                <div className="mt-2 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-accent-amber">
                  Upgrade required
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}