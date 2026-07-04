"use client";

import { useEffect, useState } from "react";
import { CornerDownLeft, Sparkles, X } from "lucide-react";

interface AiInlineSuggestionProps {
  suggestion: string | null;
  onAccept: () => void;
  onDismiss: () => void;
  position?: "inline" | "below";
}

export default function AiInlineSuggestion({
  suggestion,
  onAccept,
  onDismiss,
  position = "inline",
}: AiInlineSuggestionProps) {
  const [visible, setVisible] = useState(Boolean(suggestion));

  useEffect(() => {
    if (suggestion) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [suggestion]);

  useEffect(() => {
    if (!suggestion) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") {
        event.preventDefault();
        onAccept();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [suggestion, onAccept, onDismiss]);

  if (!visible) return null;

  if (position === "below") {
    return (
      <BelowSuggestionCard
        suggestion={suggestion}
        onAccept={onAccept}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
        opacity: suggestion ? 1 : 0,
        transition: suggestion
          ? "opacity 200ms ease"
          : "opacity 120ms ease",
      }}
    >
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .ai-inline-suggestion-animated {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      <div
        className="ai-inline-suggestion-animated"
        style={{
          fontSize: "14px",
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.25)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: "10px 12px",
          fontStyle: "italic",
        }}
      >
        {suggestion}
      </div>

      {suggestion && (
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "10px",
            height: "20px",
            padding: "0 7px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "4px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: "10px",
            color: "#454647",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            pointerEvents: "none",
          }}
        >
          <CornerDownLeft size={10} />
          Tab to accept
        </div>
      )}
    </div>
  );
}

function BelowSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: string | null;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  if (!suggestion) return null;

  return (
    <div
      className="ai-inline-suggestion-animated"
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        right: 0,
        background: "#111214",
        border: "1px solid rgba(141,107,255,0.25)",
        borderRadius: "8px",
        padding: "10px 12px",
        zIndex: 40,
        animation: "ai-inline-suggestion-fade 160ms ease",
        boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
      }}
    >
      <style>
        {`
          @keyframes ai-inline-suggestion-fade {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-inline-suggestion-animated {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: "11px",
            color: "#8d6bff",
          }}
        >
          <Sparkles size={12} />
          AI suggestion
        </div>

        <button
          type="button"
          aria-label="Dismiss AI suggestion"
          onClick={onDismiss}
          style={{
            width: "22px",
            height: "22px",
            border: "none",
            background: "transparent",
            borderRadius: "5px",
            color: "#6a6b6c",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 160ms ease, background 160ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = "#f3f3f3";
            event.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "#6a6b6c";
            event.currentTarget.style.background = "transparent";
          }}
        >
          <X size={12} />
        </button>
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#f3f3f3",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {suggestion}
      </div>

      <div
        style={{
          marginTop: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span
          style={{
            height: "20px",
            padding: "0 7px",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "4px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: "10px",
            color: "#454647",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <CornerDownLeft size={10} />
          Tab to accept
        </span>

        <button
          type="button"
          onClick={onAccept}
          className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(141,107,255,0.6)]"
          style={{
            height: "24px",
            padding: "0 8px",
            background: "rgba(141,107,255,0.12)",
            border: "1px solid rgba(141,107,255,0.25)",
            borderRadius: "5px",
            fontSize: "11px",
            color: "#8d6bff",
            cursor: "pointer",
            transition: "background 160ms ease, transform 120ms ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "rgba(141,107,255,0.20)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "rgba(141,107,255,0.12)";
          }}
          onMouseDown={(event) => {
            event.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseUp={(event) => {
            event.currentTarget.style.transform = "translateY(0)";
          }}
        >
          ↵ Accept
        </button>
      </div>
    </div>
  );
}

export { AiInlineSuggestion };