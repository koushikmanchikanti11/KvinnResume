"use client";

import React from "react";
import {
  ArrowLeft,
  Download,
  Eye,
  Link2,
  Globe,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

/**
 * EditorTopbar — 52px sticky topbar with save indicator and actions.
 */

interface EditorTopbarProps {
  resumeTitle: string;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  resumeId: string;
  isPublished: boolean;
  onPreview: () => void;
  onDownloadPDF: () => void;
  onCopyLink: () => void;
  onPublish: () => void;
  onManualSave: () => void;
}

const MONO_FONT =
  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace";

export function EditorTopbar({
  resumeTitle,
  isDirty,
  isSaving,
  saveError,
  isPublished,
  onPreview,
  onDownloadPDF,
  onCopyLink,
  onPublish,
  onManualSave,
}: EditorTopbarProps) {
  // ── Save indicator state ──
  const renderSaveIndicator = () => {
    if (saveError) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "#ff6363",
            }}
          />
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: 11,
              color: "#ff6363",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            Save failed
          </span>
          <button
            onClick={onManualSave}
            className="flex items-center gap-1 rounded transition-colors"
            style={{
              fontFamily: MONO_FONT,
              fontSize: 10,
              color: "#e7c59a",
              background: "rgba(231,197,154,0.08)",
              border: "1px solid rgba(231,197,154,0.2)",
              padding: "2px 8px",
              borderRadius: 4,
              cursor: "pointer",
            }}
            aria-label="Retry save"
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      );
    }

    if (isSaving) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="block rounded-full animate-pulse"
            style={{
              width: 7,
              height: 7,
              background: "#e7c59a",
            }}
          />
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: 11,
              color: "#e7c59a",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            Saving...
          </span>
        </div>
      );
    }

    if (isDirty) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "#e7c59a",
            }}
          />
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: 11,
              color: "#e7c59a",
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
            }}
          >
            Unsaved changes
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span
          className="block rounded-full"
          style={{
            width: 7,
            height: 7,
            background: "#00ac5c",
          }}
        />
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            color: "#00ac5c",
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}
        >
          Saved
        </span>
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: 52,
        background: "#07080a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left: back + title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard/resumes"
          className="flex items-center justify-center rounded-md transition-colors shrink-0"
          style={{
            width: 32,
            height: 32,
            color: "#9c9c9d",
            background: "transparent",
          }}
          aria-label="Back to resumes"
        >
          <ArrowLeft size={16} />
        </Link>
        <span
          className="truncate text-sm font-medium"
          style={{ color: "#f3f3f3", maxWidth: 200 }}
        >
          {resumeTitle || "Untitled Resume"}
        </span>
      </div>

      {/* Center: save indicator */}
      <div className="hidden md:flex items-center justify-center">
        {renderSaveIndicator()}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Preview button */}
        <button
          onClick={onPreview}
          className="hidden md:flex items-center gap-1.5 rounded-md transition-colors px-2.5"
          style={{
            height: 32,
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f3f3f3",
            fontSize: 12,
            fontFamily: MONO_FONT,
          }}
          aria-label="Preview resume"
        >
          <Eye size={13} />
          Preview
        </button>

        {/* Download PDF */}
        <button
          onClick={onDownloadPDF}
          className="hidden md:flex items-center gap-1.5 rounded-md transition-colors px-2.5"
          style={{
            height: 32,
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f3f3f3",
            fontSize: 12,
            fontFamily: MONO_FONT,
          }}
          aria-label="Download PDF"
        >
          <Download size={13} />
          PDF
        </button>

        {/* Copy Link — only if published */}
        {isPublished && (
          <button
            onClick={onCopyLink}
            className="hidden md:flex items-center gap-1.5 rounded-md transition-colors px-2.5"
            style={{
              height: 32,
              background: "#111214",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f3f3f3",
              fontSize: 12,
              fontFamily: MONO_FONT,
            }}
            aria-label="Copy public link"
          >
            <Link2 size={13} />
            Link
          </button>
        )}

        {/* Publish / Published */}
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 rounded-lg transition-colors px-3"
          style={{
            height: 32,
            background: isPublished ? "rgba(0,172,92,0.12)" : "#e6e6e6",
            color: isPublished ? "#00ac5c" : "#2f3031",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: MONO_FONT,
            border: isPublished
              ? "1px solid rgba(0,172,92,0.3)"
              : "1px solid transparent",
          }}
        >
          <Globe size={13} />
          {isPublished ? "Published" : "Publish"}
        </button>
      </div>
    </div>
  );
}
