"use client";

import React from "react";

/**
 * EditorShell — Pure layout wrapper for the three-panel editor.
 * No data fetching. No state except mobile tab controlled by props.
 */

interface EditorShellProps {
  sectionTree: React.ReactNode;
  formPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  mobileTab: "sections" | "edit" | "preview" | "ai";
  onMobileTabChange: (tab: "sections" | "edit" | "preview" | "ai") => void;
}

const MOBILE_TABS = [
  { key: "sections" as const, label: "Sections" },
  { key: "edit" as const, label: "Edit" },
  { key: "preview" as const, label: "Preview" },
  { key: "ai" as const, label: "AI" },
];

export function EditorShell({
  sectionTree,
  formPanel,
  previewPanel,
  mobileTab,
  onMobileTabChange,
}: EditorShellProps) {
  return (
    <div
      className="flex flex-col"
      style={{
        height: "calc(100vh - 64px - 52px)",
        background: "#040506",
        overflow: "hidden",
      }}
    >
      {/* ── Mobile tab bar ── */}
      <div
        className="flex md:hidden shrink-0"
        style={{
          height: 40,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#07080a",
        }}
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onMobileTabChange(tab.key)}
            className="flex-1 flex items-center justify-center transition-colors"
            style={{
              fontSize: 12,
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              letterSpacing: "0.04em",
              color: mobileTab === tab.key ? "#e7c59a" : "#6a6b6c",
              borderBottom:
                mobileTab === tab.key
                  ? "2px solid #e7c59a"
                  : "2px solid transparent",
              textTransform: "uppercase" as const,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Desktop: three-panel layout ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: Section Tree — 240px */}
        <div
          className="shrink-0 overflow-y-auto"
          style={{
            width: 240,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "#07080a",
          }}
        >
          {sectionTree}
        </div>

        {/* Center: Form Panel — flex 1 */}
        <div
          className="flex-1 overflow-y-auto min-w-0"
          style={{
            background: "#040506",
          }}
        >
          {formPanel}
        </div>

        {/* Right: Preview Panel — 380px */}
        <div
          className="shrink-0 overflow-y-auto"
          style={{
            width: 380,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            background: "#07080a",
          }}
        >
          {previewPanel}
        </div>
      </div>

      {/* ── Mobile: single panel ── */}
      <div className="flex-1 overflow-y-auto md:hidden">
        {mobileTab === "sections" && sectionTree}
        {mobileTab === "edit" && formPanel}
        {mobileTab === "preview" && previewPanel}
        {mobileTab === "ai" && (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "#6a6b6c", fontSize: 14 }}
          >
            AI assistant coming soon
          </div>
        )}
      </div>
    </div>
  );
}
