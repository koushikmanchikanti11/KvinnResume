"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

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
  subtitle: string;
}> = [
  {
    value: "nano",
    label: "Nano",
    paid: false,
    subtitle: "Free • Standard quality",
  },
  {
    value: "nano_mini",
    label: "Nano Mini",
    paid: false,
    subtitle: "Free • Compact output",
  },
  {
    value: "nano_pro",
    label: "Nano Pro",
    paid: true,
    subtitle: "Paid • High accuracy",
  },
  {
    value: "auto",
    label: "Auto",
    paid: true,
    subtitle: "Paid • Best for any format",
  },
];

function isLockedMode(modePaid: boolean, plan?: string | null) {
  return modePaid && (!plan || plan.toLowerCase() === "free");
}

export function ParserModeSelector({
  value,
  onChange,
  plan,
  disabled = false,
  className,
}: ParserModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<ParserMode | null>(null);

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        width: "100%",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {modes.map((mode) => {
        const locked = isLockedMode(mode.paid, plan);
        const selected = value === mode.value;
        const hovered = hoveredMode === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled || locked}
            onClick={() => {
              if (disabled || locked) return;
              onChange(mode.value);
            }}
            onMouseEnter={() => setHoveredMode(mode.value)}
            onMouseLeave={() => setHoveredMode(null)}
            style={{
              position: "relative",
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              cursor: locked || disabled ? "not-allowed" : "pointer",
              transition: "border-color 160ms ease, background 160ms ease",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              textAlign: "left",
              opacity: locked ? 0.55 : 1,
              background: locked
                ? "rgba(255,255,255,0.01)"
                : selected
                  ? "rgba(231,197,154,0.06)"
                  : hovered
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.03)",
              border: locked
                ? "1px solid rgba(255,255,255,0.05)"
                : selected
                  ? "1px solid rgba(231,197,154,0.35)"
                  : hovered
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {locked && hovered && !disabled && (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "calc(100% + 8px)",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  whiteSpace: "nowrap",
                  background: "#1b1c1e",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "11px",
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  color: "#9c9c9d",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  pointerEvents: "none",
                }}
              >
                Upgrade to unlock
              </span>
            )}

            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                width: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: locked
                    ? "#454647"
                    : selected
                      ? "#f3f3f3"
                      : "#9c9c9d",
                }}
              >
                {mode.label}
              </span>

              {locked ? (
                <Lock
                  size={12}
                  style={{
                    color: "#454647",
                    flexShrink: 0,
                  }}
                />
              ) : selected ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "999px",
                    background: "#e7c59a",
                    flexShrink: 0,
                  }}
                />
              ) : null}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                color: "#6a6b6c",
                lineHeight: 1.35,
              }}
            >
              {mode.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ParserModeSelector;