"use client";

import { Loader2, Sparkles } from "lucide-react";

interface AiCommandChipProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export default function AiCommandChip({
  label,
  onClick,
  disabled = false,
  isActive = false,
}: AiCommandChipProps) {
  const inactive = disabled || isActive;

  return (
    <button
      type="button"
      disabled={disabled || isActive}
      onClick={onClick}
      className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(141,107,255,0.6)]"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        height: "28px",
        padding: "0 10px",
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : isActive ? "default" : "pointer",
        opacity: disabled ? 0.38 : 1,
        pointerEvents: disabled ? "none" : "auto",
        background: isActive
          ? "rgba(141,107,255,0.15)"
          : "rgba(141,107,255,0.10)",
        border: isActive
          ? "1px solid rgba(141,107,255,0.35)"
          : "1px solid rgba(141,107,255,0.20)",
        borderRadius: "6px",
        color: "#8d6bff",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "Inter, system-ui, sans-serif",
        transition:
          "background 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease",
      }}
      onMouseEnter={(event) => {
        if (inactive) return;

        event.currentTarget.style.background = "rgba(141,107,255,0.18)";
        event.currentTarget.style.borderColor = "rgba(141,107,255,0.40)";
        event.currentTarget.style.color = "#a98fff";
      }}
      onMouseLeave={(event) => {
        if (inactive) return;

        event.currentTarget.style.background = "rgba(141,107,255,0.10)";
        event.currentTarget.style.borderColor = "rgba(141,107,255,0.20)";
        event.currentTarget.style.color = "#8d6bff";
      }}
      onMouseDown={(event) => {
        if (inactive) return;
        event.currentTarget.style.transform = "translateY(1px)";
      }}
      onMouseUp={(event) => {
        if (inactive) return;
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <style>
        {`
          @keyframes ai-command-chip-spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes ai-command-chip-dot {
            0%, 100% {
              opacity: 0.35;
            }
            50% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-command-chip-spinner,
            .ai-command-chip-dot {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      {isActive ? (
        <Loader2
          size={11}
          className="ai-command-chip-spinner"
          style={{
            flexShrink: 0,
            animation: "ai-command-chip-spin 1s linear infinite",
          }}
        />
      ) : (
        <Sparkles
          size={11}
          style={{
            flexShrink: 0,
          }}
        />
      )}

      <span>{label}</span>

      {isActive && (
        <span
          aria-hidden="true"
          className="ai-command-chip-dot"
          style={{
            width: "3px",
            height: "3px",
            borderRadius: "999px",
            background: "#8d6bff",
            flexShrink: 0,
            animation: "ai-command-chip-dot 900ms ease-in-out infinite",
          }}
        />
      )}
    </button>
  );
}

export { AiCommandChip };