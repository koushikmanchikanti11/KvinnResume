"use client";

import { FileText } from "lucide-react";

import FileActionMenu from "./file-action-menu";
import ParseProgressBar from "./parse-progress-bar";
import type { ParseStatus } from "./parser-status-badge";
import type { ParserMode } from "./parser-mode-selector";

export type FileRowAction =
  | "view"
  | "reParse"
  | "useInResume"
  | "downloadJson"
  | "delete";

export interface FileRowRecord {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT";
  status: ParseStatus;
  parserMode: ParserMode | null;
  pages: number | null;
  creditsUsed: number | null;
  updatedAt: string;
  parseProgress?: number;
}

interface FileRowProps {
  file: FileRowRecord;
  onAction: (action: FileRowAction, fileId: string) => void;
}

function getParserModeLabel(mode: ParserMode | null) {
  switch (mode) {
    case "nano":
      return "Nano";
    case "nano_mini":
      return "Nano Mini";
    case "nano_pro":
      return "Nano Pro";
    case "auto":
      return "Auto";
    default:
      return "—";
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;

  return `${years}y ago`;
}

function clampProgress(progress?: number) {
  if (typeof progress !== "number") return 0;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

export default function FileRow({ file, onAction }: FileRowProps) {
  const isRunning = file.status === "running";
  const isPending = file.status === "pending";
  const progress = clampProgress(file.parseProgress);

  return (
    <tr
      style={{
        height: "52px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 160ms ease",
        cursor: "default",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
      }}
    >
      {/* Name */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          minWidth: "160px",
          maxWidth: "220px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: isRunning || isPending ? "flex-start" : "center",
            gap: "9px",
            minWidth: 0,
            width: "100%",
          }}
        >
          <FileText
            size={14}
            style={{
              color: "#6a6b6c",
              flexShrink: 0,
              marginTop: isRunning || isPending ? "2px" : 0,
            }}
          />

          <div
            style={{
              minWidth: 0,
              width: "100%",
              maxWidth: "180px",
            }}
          >
            <div
              title={file.name}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#f3f3f3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "180px",
                lineHeight: 1.25,
              }}
            >
              {file.name}
            </div>

            {(isRunning || isPending) && (
              <div
                style={{
                  marginTop: "6px",
                  width: "100%",
                }}
              >
                <ParseProgressBar
                  status={file.status}
                  progress={progress}
                  size="sm"
                  label={isPending ? "Queued…" : "Parsing…"}
                  showPercentage={isRunning}
                />
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            height: "20px",
            padding: "0 7px",
            display: "inline-flex",
            alignItems: "center",
            background: "#1b1c1e",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "5px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            fontSize: "11px",
            fontWeight: 500,
            color: "#9c9c9d",
          }}
        >
          {file.type}
        </span>
      </td>

      {/* Status */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
        }}
      >
        <FileStatusCell status={file.status} />
      </td>

      {/* Parser */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#9c9c9d",
        }}
      >
        {getParserModeLabel(file.parserMode)}
      </td>

      {/* Pages */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#6a6b6c",
        }}
      >
        {file.pages ?? "—"}
      </td>

      {/* Credits */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#6a6b6c",
        }}
      >
        {file.creditsUsed ?? "—"}
      </td>

      {/* Updated */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#6a6b6c",
        }}
      >
        {formatRelativeTime(file.updatedAt)}
      </td>

      {/* Actions */}
      <td
        style={{
          padding: "0 16px",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        <FileActionMenu
          fileId={file.id}
          fileName={file.name}
          status={file.status}
          onView={() => onAction("view", file.id)}
          onReParse={() => onAction("reParse", file.id)}
          onUseInResume={() => onAction("useInResume", file.id)}
          onDownloadJson={() => onAction("downloadJson", file.id)}
          onDelete={() => onAction("delete", file.id)}
        />
      </td>
    </tr>
  );
}

function FileStatusCell({ status }: { status: ParseStatus }) {
  const ParserStatusBadge = require("./parser-status-badge").default as React.ComponentType<{
    status: ParseStatus;
  }>;

  return <ParserStatusBadge status={status} />;
}