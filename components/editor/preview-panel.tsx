"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import type { ResumeData } from "@/lib/resume/schema";
import { ThemeSelector } from "./theme-selector";

interface PreviewPanelProps {
  resumeJson: ResumeData;
  resumeId: string;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  isPublished: boolean;
  publicSlug: string | null;
}

export function PreviewPanel({
  resumeJson,
  resumeId,
  selectedTheme,
  onThemeChange,
}: PreviewPanelProps) {
  const [zoom, setZoom] = useState(1);

  // Since Phase 8 builds the template engine, we just render a simple structured preview here.
  // This validates the data is flowing correctly.

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="flex flex-col h-full bg-[#07080a]">
      {/* Top section: Theme selector */}
      <ThemeSelector
        selectedTheme={selectedTheme}
        onThemeChange={onThemeChange}
      />

      {/* Controls bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#040506",
        }}
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
          Live Preview
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center rounded transition-colors"
            style={{ width: 24, height: 24, color: "#9c9c9d", background: "transparent" }}
            aria-label="Zoom out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={handleZoomReset}
            className="flex items-center justify-center rounded transition-colors"
            style={{ width: 24, height: 24, color: "#9c9c9d", background: "transparent" }}
            aria-label="Reset zoom"
          >
            <Maximize size={12} />
          </button>
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center rounded transition-colors"
            style={{ width: 24, height: 24, color: "#9c9c9d", background: "transparent" }}
            aria-label="Zoom in"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8"
        style={{ background: "#040506" }}
      >
        <div
          className="mx-auto bg-white transition-transform origin-top"
          style={{
            width: 794, // A4 width at 96 DPI
            minHeight: 1123, // A4 height at 96 DPI
            transform: `scale(${zoom})`,
            padding: "40px",
            color: "#000",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            marginBottom: 40,
          }}
        >
          {/* A very basic structural render just to prove data flows. Phase 8 will replace this. */}
          <div className="border-b border-gray-300 pb-4 mb-4">
            <h1 className="text-3xl font-bold">{resumeJson.basics.fullName || "Your Name"}</h1>
            <p className="text-gray-600 mt-1">{resumeJson.basics.headline}</p>
            <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {resumeJson.basics.email && <span>{resumeJson.basics.email}</span>}
              {resumeJson.basics.phone && <span>{resumeJson.basics.phone}</span>}
              {resumeJson.basics.location && <span>{resumeJson.basics.location}</span>}
              {resumeJson.basics.website && <span>{resumeJson.basics.website}</span>}
            </div>
          </div>

          {resumeJson.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">Summary</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{resumeJson.summary}</p>
            </div>
          )}

          {resumeJson.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">Experience</h2>
              <div className="flex flex-col gap-4">
                {resumeJson.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-base">{exp.position}</h3>
                      <span className="text-sm text-gray-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm">{exp.company}</span>
                      <span className="text-sm text-gray-500">{exp.location}</span>
                    </div>
                    {exp.description && <p className="text-sm mb-2">{exp.description}</p>}
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Just enough to show that the editor is working */}
          <div className="mt-8 text-center text-xs text-gray-400 font-mono">
            Full template rendering engine coming in Phase 8
            <br />
            Selected Theme: {selectedTheme}
          </div>
        </div>
      </div>
    </div>
  );
}
