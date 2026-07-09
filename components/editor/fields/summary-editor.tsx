"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/**
 * SummaryEditor — Edit summary string with character count and AI button.
 */

interface SummaryEditorProps {
  data: string;
  onChange: (updated: string) => void;
  onAIRequest?: (feature: string, context: unknown) => void;
}

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontFamily:
    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#6a6b6c",
  marginBottom: 6,
};

export function SummaryEditor({ data, onChange, onAIRequest }: SummaryEditorProps) {
  const charCount = data.length;
  const isGood = charCount > 60;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label style={LABEL_STYLE} htmlFor="summary-editor">
          Professional Summary
        </label>

        {onAIRequest && (
          <button
            onClick={() => onAIRequest("improve_summary", { summary: data })}
            className="flex items-center gap-1 rounded-md transition-colors"
            style={{
              fontSize: 11,
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              color: "#8d6bff",
              background: "rgba(141,107,255,0.1)",
              border: "1px solid rgba(141,107,255,0.2)",
              padding: "3px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
            aria-label="AI rewrite summary"
          >
            <Sparkles size={11} />
            AI Rewrite
          </button>
        )}
      </div>

      <textarea
        id="summary-editor"
        value={data}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Passionate software engineer with 5+ years of experience building scalable web applications..."
        className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
        style={{
          width: "100%",
          minHeight: 120,
          padding: "10px 12px",
          fontSize: 14,
          color: "#f3f3f3",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          outline: "none",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          lineHeight: 1.6,
          resize: "vertical" as const,
        }}
      />

      {/* Character count */}
      <div className="flex items-center justify-end gap-2">
        <span
          style={{
            fontSize: 11,
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            color: isGood ? "#00ac5c" : charCount > 0 ? "#e7c59a" : "#454647",
          }}
        >
          {charCount} chars {isGood ? "✓" : charCount > 0 ? "(min 60)" : ""}
        </span>
      </div>
    </div>
  );
}
