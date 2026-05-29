"use client";

import React from "react";
import { FileText, FileJson, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParserStatusBadge } from "./parser-status-badge";
import { FileActionMenu } from "./file-action-menu";

interface SourceFile {
  id: string;
  fileId?: string;
  original_filename?: string;
  filename?: string;
  file_size?: number;
  parse_status?: string;
  parser_mode?: string;
  pages_count?: number;
  created_at?: string;
  resume_id?: string | null;
  storage_path?: string;
  [key: string]: any;
}

interface FileRowProps {
  file: SourceFile;
  onDelete: (id: string) => void;
  onReparse: (file: SourceFile) => void;
  onPreviewJson: (json: any) => void;
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "—";

  try {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  } catch {
    return "—";
  }
}

function normalizeMode(mode?: string | null) {
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
      return mode || "—";
  }
}

const getFileExtensionLabel = (filename?: string) => {
  if (!filename) return "PDF";
  const ext = filename.split(".").pop()?.toUpperCase() || "";
  return ext || "PDF";
};

export function FileRow({
  file,
  onDelete,
  onReparse,
  onPreviewJson,
}: FileRowProps) {
  const filename = file.original_filename || file.filename || "Untitled file";
  const fileType = getFileExtensionLabel(filename);
  const sizeLabel = formatBytes(file.file_size);
  const status = file.parse_status || "not_started";
  const mode = file.parser_mode;
  const hasParsedJson = status === "completed";

  return (
    <>
      {/* Desktop row */}
      <tr className="hidden border-b border-white/[0.05] transition hover:bg-white/[0.025] md:table-row">
        <td className="py-3 pl-4 pr-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-kv-surface-4">
              {hasParsedJson ? (
                <FileJson className="h-4 w-4 text-kv-accent-violet" />
              ) : (
                <FileText className="h-4 w-4 text-kv-text-muted" />
              )}
            </span>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-kv-text-primary" title={filename}>
                {filename}
              </p>
              <p className="mt-0.5 font-jetbrains text-[11px] uppercase tracking-[0.08em] text-kv-text-disabled">
                {fileType} • {sizeLabel}
              </p>
            </div>
          </div>
        </td>

        <td className="px-3 py-3">
          {mode && mode !== "—" ? (
            <span className="inline-flex rounded-md border border-kv-accent-violet/25 bg-kv-accent-violet/10 px-2 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-[#c8b6ff]">
              {normalizeMode(mode)}
            </span>
          ) : (
            <span className="font-jetbrains text-[12px] text-kv-text-muted">—</span>
          )}
        </td>

        <td className="px-3 py-3">
          <ParserStatusBadge status={status} />
        </td>

        <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted whitespace-nowrap">
          {file.pages_count ?? "—"} {file.pages_count === 1 ? "page" : "pages"}
        </td>

        <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted whitespace-nowrap">
          {formatRelativeTime(file.created_at)}
        </td>

        <td className="py-3 pl-3 pr-4 text-right">
          <div className="flex justify-end">
            <FileActionMenu
              file={file}
              onDelete={onDelete}
              onReparse={onReparse}
              onPreviewJson={onPreviewJson}
            />
          </div>
        </td>
      </tr>

      {/* Mobile card */}
      <tr className="md:hidden table-row border-b border-white/[0.04]">
        <td colSpan={6} className="px-4 py-4">
          <div
            className={cn(
              "flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-kv-surface-3 p-4",
              "shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-kv-surface-4">
                  {hasParsedJson ? (
                    <FileJson className="h-4 w-4 text-kv-accent-violet" />
                  ) : (
                    <FileText className="h-4 w-4 text-kv-text-muted" />
                  )}
                </span>

                <div className="min-w-0">
                  <p className="line-clamp-1 text-[14px] font-semibold text-kv-text-primary">
                    {filename}
                  </p>
                  <p className="mt-1 font-jetbrains text-[11px] uppercase tracking-[0.08em] text-kv-text-disabled">
                    {sizeLabel} • {file.pages_count ?? "—"} {file.pages_count === 1 ? "page" : "pages"}
                  </p>
                </div>
              </div>

              <FileActionMenu
                file={file}
                onDelete={onDelete}
                onReparse={onReparse}
                onPreviewJson={onPreviewJson}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {mode && mode !== "—" && (
                <span className="inline-flex rounded-md border border-kv-accent-violet/25 bg-kv-accent-violet/10 px-2 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-[#c8b6ff]">
                  {normalizeMode(mode)}
                </span>
              )}

              <ParserStatusBadge status={status} />
            </div>

            <div className="mt-2 flex items-center gap-1.5 font-jetbrains text-[11px] uppercase tracking-[0.08em] text-kv-text-disabled">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRelativeTime(file.created_at)}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
