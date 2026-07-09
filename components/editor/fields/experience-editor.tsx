"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData, ResumeExperienceItem } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

/**
 * ExperienceEditor — Edit experience array with highlights.
 */

interface ExperienceEditorProps {
  data: ResumeData["experience"];
  onChange: (updated: ResumeData["experience"]) => void;
  onAIRequest?: (feature: string, context: unknown) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  fontSize: 14,
  color: "#f3f3f3",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  outline: "none",
  fontFamily: "var(--font-inter), Inter, sans-serif",
};

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

export function ExperienceEditor({
  data,
  onChange,
  onAIRequest,
}: ExperienceEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateItem = (index: number, updates: Partial<ResumeExperienceItem>) => {
    const next = [...data];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const addItem = () => {
    const newId = crypto.randomUUID();
    const newItem: ResumeExperienceItem = {
      id: newId,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    };
    onChange([...data, newItem]);
    setExpandedIds((prev) => new Set(prev).add(newId));
  };

  const removeItem = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addHighlight = (index: number) => {
    const next = [...data];
    next[index] = {
      ...next[index],
      highlights: [...next[index].highlights, ""],
    };
    onChange(next);
  };

  const updateHighlight = (
    itemIndex: number,
    highlightIndex: number,
    value: string
  ) => {
    const next = [...data];
    const highlights = [...next[itemIndex].highlights];
    highlights[highlightIndex] = value;
    next[itemIndex] = { ...next[itemIndex], highlights };
    onChange(next);
  };

  const removeHighlight = (itemIndex: number, highlightIndex: number) => {
    const next = [...data];
    const highlights = next[itemIndex].highlights.filter(
      (_, i) => i !== highlightIndex
    );
    next[itemIndex] = { ...next[itemIndex], highlights };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-8 rounded-lg"
          style={{
            border: "1px dashed rgba(255,255,255,0.08)",
            color: "#454647",
          }}
        >
          <span style={{ fontSize: 13 }}>No experience entries yet</span>
        </div>
      )}

      {data.map((item, index) => (
        <ResumeEntryCard
          key={item.id}
          title={item.position || item.company || "New Position"}
          subtitle={item.company ? `${item.company}${item.location ? ` · ${item.location}` : ""}` : undefined}
          isExpanded={expandedIds.has(item.id)}
          onToggle={() => toggleExpanded(item.id)}
          onDelete={() => removeItem(item.id)}
          onAIAction={
            onAIRequest
              ? () =>
                  onAIRequest("generate_bullets", {
                    company: item.company,
                    position: item.position,
                    description: item.description,
                  })
              : undefined
          }
        >
          <div className="flex flex-col gap-3">
            {/* Row: Position + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label style={LABEL_STYLE} htmlFor={`exp-position-${item.id}`}>
                  Position
                </label>
                <input
                  id={`exp-position-${item.id}`}
                  type="text"
                  value={item.position}
                  onChange={(e) =>
                    updateItem(index, { position: e.target.value })
                  }
                  placeholder="Software Engineer"
                  style={INPUT_STYLE}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor={`exp-company-${item.id}`}>
                  Company
                </label>
                <input
                  id={`exp-company-${item.id}`}
                  type="text"
                  value={item.company}
                  onChange={(e) =>
                    updateItem(index, { company: e.target.value })
                  }
                  placeholder="Google"
                  style={INPUT_STYLE}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>
            </div>

            {/* Row: Location */}
            <div>
              <label style={LABEL_STYLE} htmlFor={`exp-location-${item.id}`}>
                Location
              </label>
              <input
                id={`exp-location-${item.id}`}
                type="text"
                value={item.location}
                onChange={(e) =>
                  updateItem(index, { location: e.target.value })
                }
                placeholder="Bangalore, India"
                style={INPUT_STYLE}
                className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
              />
            </div>

            {/* Row: Start date + End date + Current */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label style={LABEL_STYLE} htmlFor={`exp-start-${item.id}`}>
                  Start Date
                </label>
                <input
                  id={`exp-start-${item.id}`}
                  type="text"
                  value={item.startDate}
                  onChange={(e) =>
                    updateItem(index, { startDate: e.target.value })
                  }
                  placeholder="Jan 2022"
                  style={INPUT_STYLE}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor={`exp-end-${item.id}`}>
                  End Date
                </label>
                <input
                  id={`exp-end-${item.id}`}
                  type="text"
                  value={item.current ? "Present" : item.endDate}
                  onChange={(e) =>
                    updateItem(index, { endDate: e.target.value, current: false })
                  }
                  placeholder="Present"
                  disabled={item.current}
                  style={{
                    ...INPUT_STYLE,
                    opacity: item.current ? 0.5 : 1,
                  }}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>
              <div className="flex items-end">
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ height: 36 }}
                >
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) =>
                      updateItem(index, {
                        current: e.target.checked,
                        endDate: e.target.checked ? "" : item.endDate,
                      })
                    }
                    className="accent-[#e7c59a]"
                  />
                  <span style={{ fontSize: 12, color: "#9c9c9d" }}>
                    Current
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={LABEL_STYLE} htmlFor={`exp-desc-${item.id}`}>
                Description
              </label>
              <textarea
                id={`exp-desc-${item.id}`}
                value={item.description}
                onChange={(e) =>
                  updateItem(index, { description: e.target.value })
                }
                placeholder="Brief description of your role..."
                className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                style={{
                  width: "100%",
                  minHeight: 60,
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "#f3f3f3",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  outline: "none",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  resize: "vertical" as const,
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Highlights / Bullet points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ ...LABEL_STYLE, marginBottom: 0 }}>
                  Key Highlights
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily:
                      "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                    color:
                      item.highlights.length >= 2 ? "#00ac5c" : "#e7c59a",
                  }}
                >
                  {item.highlights.length} bullet{item.highlights.length !== 1 ? "s" : ""}{" "}
                  {item.highlights.length < 2 ? "(min 2)" : "✓"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {item.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2">
                    <span
                      className="shrink-0 mt-2.5"
                      style={{ color: "#454647", fontSize: 8 }}
                    >
                      ●
                    </span>
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) =>
                        updateHighlight(index, hIdx, e.target.value)
                      }
                      placeholder="Achieved 40% increase in API performance..."
                      style={{ ...INPUT_STYLE, flex: 1 }}
                      className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                      aria-label={`Highlight ${hIdx + 1}`}
                    />
                    <button
                      onClick={() => removeHighlight(index, hIdx)}
                      className="shrink-0 flex items-center justify-center mt-1.5 rounded-md transition-colors"
                      style={{
                        width: 24,
                        height: 24,
                        color: "#ff8c8c",
                        background: "transparent",
                      }}
                      aria-label={`Remove highlight ${hIdx + 1}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addHighlight(index)}
                className="flex items-center gap-1.5 mt-2 rounded-md transition-colors"
                style={{
                  fontSize: 12,
                  color: "#9c9c9d",
                  background: "transparent",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <Plus size={12} />
                Add bullet
              </button>
            </div>
          </div>
        </ResumeEntryCard>
      ))}

      {/* Add experience button */}
      <button
        onClick={addItem}
        className="flex items-center justify-center gap-2 rounded-lg transition-colors"
        style={{
          height: 40,
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#f3f3f3",
          fontSize: 13,
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          cursor: "pointer",
        }}
      >
        <Plus size={14} />
        Add Experience
      </button>
    </div>
  );
}
