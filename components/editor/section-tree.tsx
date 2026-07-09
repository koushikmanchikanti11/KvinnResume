"use client";

import React from "react";
import type { ResumeData } from "@/lib/resume/schema";
import { SECTION_LABELS, SECTION_ICONS, DEFAULT_SECTION_ORDER } from "@/lib/resume/schema";

/**
 * SectionTree — Left panel navigation with status indicators and count badges.
 */

interface SectionTreeProps {
  resumeJson: ResumeData;
  activeSection: string;
  onSectionClick: (section: string) => void;
  onSectionRemove?: (section: string) => void;
  onAddSection?: () => void;
}

type SectionStatus = "complete" | "needs_work" | "empty";

const STATUS_COLORS: Record<SectionStatus, string> = {
  complete: "#00ac5c",
  needs_work: "#e7c59a",
  empty: "#454647",
};

function getSectionStatus(
  section: string,
  data: ResumeData
): { status: SectionStatus; count?: number } {
  switch (section) {
    case "basics": {
      const b = data.basics;
      if (b.fullName && b.email) return { status: "complete" };
      if (b.fullName || b.email) return { status: "needs_work" };
      return { status: "empty" };
    }
    case "summary": {
      if (data.summary.length > 60) return { status: "complete" };
      if (data.summary.length > 0) return { status: "needs_work" };
      return { status: "empty" };
    }
    case "experience": {
      const items = data.experience;
      if (items.length === 0) return { status: "empty", count: 0 };
      const allGood = items.every((e) => e.highlights.length >= 2);
      return {
        status: allGood ? "complete" : "needs_work",
        count: items.length,
      };
    }
    case "education": {
      const items = data.education;
      if (items.length === 0) return { status: "empty", count: 0 };
      const allGood = items.every((e) => e.institution && e.degree);
      return {
        status: allGood ? "complete" : "needs_work",
        count: items.length,
      };
    }
    case "skills": {
      const items = data.skills;
      if (items.length === 0) return { status: "empty", count: 0 };
      return {
        status: items.length >= 3 ? "complete" : "needs_work",
        count: items.length,
      };
    }
    case "projects": {
      const items = data.projects;
      return {
        status: items.length > 0 ? "complete" : "empty",
        count: items.length,
      };
    }
    case "certifications": {
      const items = data.certifications;
      return {
        status: items.length > 0 ? "complete" : "empty",
        count: items.length,
      };
    }
    case "achievements": {
      const items = data.achievements;
      return {
        status: items.length > 0 ? "complete" : "empty",
        count: items.length,
      };
    }
    case "socialLinks": {
      const items = data.socialLinks;
      const hasValidUrl = items.some(
        (s) => s.url && s.url.startsWith("http")
      );
      return {
        status: hasValidUrl ? "complete" : items.length > 0 ? "needs_work" : "empty",
        count: items.length,
      };
    }
    case "customSections": {
      const items = data.customSections;
      return {
        status: items.length > 0 ? "complete" : "empty",
        count: items.length,
      };
    }
    default:
      return { status: "empty" };
  }
}

export function SectionTree({
  resumeJson,
  activeSection,
  onSectionClick,
}: SectionTreeProps) {
  const sections = resumeJson.sectionOrder?.length
    ? resumeJson.sectionOrder
    : [...DEFAULT_SECTION_ORDER];

  return (
    <div className="flex flex-col py-2" style={{ width: "100%" }}>
      {/* Header */}
      <div
        className="px-4 pb-2 mb-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#6a6b6c",
          }}
        >
          Sections
        </span>
      </div>

      {/* Section rows */}
      {sections.map((section) => {
        const isActive = activeSection === section;
        const { status, count } = getSectionStatus(section, resumeJson);
        const label = SECTION_LABELS[section] || section;
        const icon = SECTION_ICONS[section] || "📄";

        return (
          <button
            key={section}
            onClick={() => onSectionClick(section)}
            className="flex items-center gap-2.5 w-full text-left transition-colors"
            style={{
              height: 36,
              paddingLeft: isActive ? 13 : 16,
              paddingRight: 12,
              background: isActive ? "#111214" : "transparent",
              borderLeft: isActive ? "3px solid #e7c59a" : "3px solid transparent",
              cursor: "pointer",
            }}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Icon */}
            <span style={{ fontSize: 13, lineHeight: 1, width: 18, textAlign: "center" }}>
              {icon}
            </span>

            {/* Label */}
            <span
              className="flex-1 truncate"
              style={{
                fontSize: 13,
                color: isActive ? "#f3f3f3" : "#9c9c9d",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              {label}
            </span>

            {/* Count badge (for array sections) */}
            {count !== undefined && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  color: "#6a6b6c",
                  background: "rgba(255,255,255,0.04)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                {count}
              </span>
            )}

            {/* Status dot */}
            <span
              className="shrink-0 rounded-full"
              style={{
                width: 6,
                height: 6,
                background: STATUS_COLORS[status],
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
