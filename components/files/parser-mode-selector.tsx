"use client";

import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ParserMode = "nano" | "nano_mini" | "nano_pro" | "auto";

type ParserModeSelectorProps = {
  value: ParserMode;
  onChange: (value: ParserMode) => void;
  plan?: string | null;
  disabled?: boolean;
  className?: string;
};

const modes: Array<{
  value: ParserMode;
  label: string;
  paid: boolean;
}> = [
  { value: "nano", label: "Nano", paid: false },
  { value: "nano_mini", label: "Nano Mini", paid: false },
  { value: "nano_pro", label: "Nano Pro", paid: true },
  { value: "auto", label: "Auto", paid: true },
];

function isFreePlan(plan?: string | null) {
  return !plan || plan.toLowerCase() === "free";
}

function getModeLabel(value: ParserMode) {
  return modes.find((mode) => mode.value === value)?.label ?? "Nano";
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
      <p className="mb-2 font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
        Parse Mode
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          style={{
            width: "100%",
            height: "42px",
            borderRadius: "10px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            fontSize: "12px",
            fontWeight: 500,
            color: "#f3f3f3",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span>{getModeLabel(value)}</span>
          <ChevronDown className="h-4 w-4 text-kv-text-muted" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          style={{
            width: "260px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "13px",
            padding: "6px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          }}
          className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        >
          {modes.map((mode) => {
            const locked = free && mode.paid;
            const selected = value === mode.value;

            return (
              <DropdownMenuItem
                key={mode.value}
                disabled={locked}
                onClick={() => {
                  if (!locked) onChange(mode.value);
                }}
                style={{
                  padding: "10px 14px",
                  color: locked
                    ? "#4b4c4d"
                    : selected
                      ? "#f3f3f3"
                      : "#9c9c9d",
                  cursor: locked ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  background: selected
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
                onMouseEnter={(e) => {
                  if (!locked) {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#f3f3f3";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selected
                    ? "rgba(255,255,255,0.05)"
                    : "transparent";

                  e.currentTarget.style.color = locked
                    ? "#4b4c4d"
                    : selected
                      ? "#f3f3f3"
                      : "#9c9c9d";
                }}
              >
                <span>{mode.label}</span>
                {locked ? <Lock className="h-4 w-4" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}