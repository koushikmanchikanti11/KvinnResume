"use client";

import React from "react";
import { FileText, Loader2 } from "lucide-react";
import { FileRow } from "./file-row";

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

interface FileTableProps {
  files: SourceFile[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onReparse: (file: SourceFile) => void;
  onPreviewJson: (json: any, file: SourceFile) => void;
  onBrowseClick?: () => void;
}

export function FileTable({
  files,
  isLoading,
  onDelete,
  onReparse,
  onPreviewJson,
  onBrowseClick,
}: FileTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.08] bg-kv-surface-3 shadow-xl">
        <Loader2 className="h-7 w-7 animate-spin text-kv-accent-amber" />
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.16em] text-kv-text-disabled">
          Loading files registry...
        </p>
      </div>
    );
  }

  if (!files?.length) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-kv-surface-3 p-8 text-center shadow-xl">
        <p className="font-jetbrains text-[11px] uppercase tracking-[0.16em] text-kv-accent-amber">
          NO_FILES_FOUND
        </p>
        <h3 className="mt-3 text-[18px] font-semibold text-kv-text-primary">
          Upload your first document
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-kv-text-muted">
          Your parsed files will appear here with parser status, JSON preview,
          page count, and re-parse actions.
        </p>
        {onBrowseClick && (
          <button
            type="button"
            onClick={onBrowseClick}
            className="mt-6 flex h-9 items-center justify-center rounded-lg bg-[#e6e6e6] px-5 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.08em] text-[#000] transition hover:bg-white active:translate-y-px"
          >
            Browse Files
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-kv-surface-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
            FILE_SYSTEM
          </p>
          <h2 className="mt-1 text-[16px] font-semibold text-kv-text-primary">
            Uploaded Files
          </h2>
        </div>
        <span className="rounded-md border border-white/[0.08] bg-kv-surface-4 px-2.5 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-muted font-semibold">
          {files.length} active
        </span>
      </div>

      <div className="w-full">
        <table className="w-full table-fixed border-collapse">
          <thead className="hidden bg-kv-surface-2 md:table-header-group">
            <tr className="border-b border-white/[0.06]">
              <th className="w-[35%] px-4 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                File
              </th>
              <th className="w-[15%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                Mode
              </th>
              <th className="w-[20%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                Status
              </th>
              <th className="w-[10%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                Pages
              </th>
              <th className="w-[12%] px-3 py-3 text-left font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                Updated
              </th>
              <th className="w-[8%] px-4 py-3 text-right font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
                Menu
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onDelete={onDelete}
                onReparse={onReparse}
                onPreviewJson={(json) => onPreviewJson(json, file)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
