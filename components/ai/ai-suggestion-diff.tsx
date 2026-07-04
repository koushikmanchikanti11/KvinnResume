"use client";

import { useEffect, useState } from "react";
import AcceptRejectControls from "./accept-reject-controls";

interface AiSuggestionDiffProps {
  before: string;
  after: string;
  isLoading?: boolean;
  onAccept: () => void;
  onTryAgain: () => void;
  onEdit: (editedText: string) => void;
}

export default function AiSuggestionDiff({
  before,
  after,
  isLoading = false,
  onAccept,
  onTryAgain,
  onEdit,
}: AiSuggestionDiffProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(after);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setEditedText(after);

    if (!after || isLoading) return;

    setHighlight(true);

    const timer = window.setTimeout(() => {
      setHighlight(false);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [after, isLoading]);

  function handleSaveEdit() {
    const nextText = editedText.trim();

    if (!nextText) return;

    onEdit(nextText);
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditedText(after);
    setIsEditing(false);
  }

  return (
    <div
      style={{
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "12px",
        marginTop: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <style>
        {`
          @keyframes ai-diff-skeleton-pulse {
            0%, 100% {
              opacity: 0.35;
            }
            50% {
              opacity: 0.7;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-diff-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      {/* Before */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <SectionLabel>BEFORE</SectionLabel>

        <div
          style={{
            fontSize: "13px",
            color: "#6a6b6c",
            textDecoration: "line-through",
            textDecorationColor: "rgba(106,107,108,0.6)",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {before}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.06)",
        }}
      />

      {/* After */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <SectionLabel>AFTER</SectionLabel>

          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "999px",
              background: "#8d6bff",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: "10px",
              color: "#8d6bff",
            }}
          >
            AI
          </span>
        </div>

        {isLoading ? (
          <AfterSkeleton />
        ) : isEditing ? (
          <textarea
            value={editedText}
            onChange={(event) => setEditedText(event.target.value)}
            autoFocus
            style={{
              width: "100%",
              minHeight: "64px",
              resize: "vertical",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(231,197,154,0.4)",
              borderRadius: "6px",
              padding: "8px 10px",
              fontSize: "13px",
              color: "#f3f3f3",
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.55,
              outline: "none",
            }}
          />
        ) : (
          <div
            className="ai-diff-animated"
            style={{
              fontSize: "13px",
              color: "#f3f3f3",
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: highlight ? "rgba(141,107,255,0.08)" : "transparent",
              borderRadius: "4px",
              padding: highlight ? "2px 0" : 0,
              transition: "background 1200ms ease, padding 1200ms ease",
            }}
          >
            {after}
          </div>
        )}
      </div>

      {/* Footer */}
      {isEditing ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
          }}
        >
          <button
            type="button"
            onClick={handleSaveEdit}
            className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
            style={{
              height: "26px",
              padding: "0 10px",
              background: "transparent",
              border: "1px solid rgba(89,212,153,0.25)",
              borderRadius: "6px",
              color: "#59d499",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition:
                "background 160ms ease, border-color 160ms ease, transform 120ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(89,212,153,0.08)";
              event.currentTarget.style.borderColor = "rgba(89,212,153,0.4)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
              event.currentTarget.style.borderColor = "rgba(89,212,153,0.25)";
            }}
            onMouseDown={(event) => {
              event.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Save Edit
          </button>

          <button
            type="button"
            onClick={handleCancelEdit}
            className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
            style={{
              height: "26px",
              padding: "0 10px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              color: "#9c9c9d",
              fontSize: "12px",
              fontWeight: 400,
              cursor: "pointer",
              transition:
                "background 160ms ease, color 160ms ease, transform 120ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(255,255,255,0.04)";
              event.currentTarget.style.color = "#f3f3f3";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
              event.currentTarget.style.color = "#9c9c9d";
            }}
            onMouseDown={(event) => {
              event.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <AcceptRejectControls
          onAccept={onAccept}
          onTryAgain={onTryAgain}
          onEdit={() => setIsEditing(true)}
          isLoading={isLoading}
          size="sm"
        />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily:
          "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
        fontSize: "10px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#454647",
      }}
    >
      {children}
    </span>
  );
}

function AfterSkeleton() {
  return (
    <div
      style={{
        marginTop: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {["100%", "80%", "55%"].map((width) => (
        <div
          key={width}
          className="ai-diff-animated"
          style={{
            width,
            height: "12px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "3px",
            animation: "ai-diff-skeleton-pulse 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

export { AiSuggestionDiff };