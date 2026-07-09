"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Sparkles, GripVertical } from "lucide-react";

/**
 * ResumeEntryCard — Reusable collapsible card for one array item.
 * Used by experience, education, projects, certifications, achievements, etc.
 *
 * No Supabase awareness. No API calls.
 */

interface ResumeEntryCardProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAIAction?: () => void;
  dragHandleProps?: Record<string, unknown>;
  children: React.ReactNode;
}

export function ResumeEntryCard({
  title,
  subtitle,
  isExpanded,
  onToggle,
  onDelete,
  onAIAction,
  dragHandleProps,
  children,
}: ResumeEntryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group rounded-lg transition-all duration-150"
      style={{
        background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
        border: `1px solid ${isExpanded ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 cursor-pointer select-none"
        style={{ height: 44 }}
        onClick={onToggle}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="flex items-center cursor-grab active:cursor-grabbing"
            style={{ color: "#454647" }}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
        )}

        {/* Expand/collapse */}
        <div style={{ color: "#6a6b6c" }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <span
            className="block truncate text-sm"
            style={{
              color: title ? "#f3f3f3" : "#454647",
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            {title || "Untitled"}
          </span>
          {subtitle && (
            <span
              className="block truncate text-xs"
              style={{ color: "#6a6b6c" }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 transition-opacity duration-150"
          style={{ opacity: isHovered ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {onAIAction && (
            <button
              onClick={onAIAction}
              className="flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 28,
                height: 28,
                background: "rgba(141,107,255,0.1)",
                border: "1px solid rgba(141,107,255,0.2)",
                color: "#8d6bff",
              }}
              aria-label="AI enhance"
            >
              <Sparkles size={12} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 28,
              height: 28,
              background: "transparent",
              border: "1px solid rgba(255,99,99,0.2)",
              color: "#ff8c8c",
            }}
            aria-label="Delete entry"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1">
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 12,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
