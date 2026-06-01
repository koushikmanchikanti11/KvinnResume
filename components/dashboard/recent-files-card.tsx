"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  ChevronRight,
  FileText,
  RefreshCw,
  UploadCloud,
} from "lucide-react";

export type ParseStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

type ParserMode = "nano" | "nano_mini" | "nano_pro" | "auto" | null;

interface RecentFilesCardProps {
  userId: string;
  onViewAll?: () => void;
  onReParse?: (fileId: string) => void;
}

interface ResumeFileRow {
  id: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  parse_status: string;
  parser_mode: string | null;
  pages_count: number | null;
  created_at: string;
}

interface RecentFile {
  id: string;
  name: string;
  type: string;
  size: number | null;
  status: ParseStatus;
  parser: ParserMode;
  pages: number | null;
  created_at: string;
}

function normalizeStatus(status: string | null): ParseStatus {
  if (status === "pending") return "pending";
  if (status === "running") return "running";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";

  // DB default is "not_started", but UI should only use allowed parse statuses.
  return "pending";
}

function normalizeParserMode(mode: string | null): ParserMode {
  if (mode === "nano") return "nano";
  if (mode === "nano_mini") return "nano_mini";
  if (mode === "nano_pro") return "nano_pro";
  if (mode === "auto") return "auto";

  return "auto";
}

function getParserModeLabel(mode: ParserMode) {
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
      return "Auto";
  }
}

function getFileTypeFromMime(mimeType?: string | null) {
  if (!mimeType) return "FILE";

  if (mimeType.includes("pdf")) return "PDF";
  if (
    mimeType.includes("word") ||
    mimeType.includes("docx") ||
    mimeType.includes("officedocument.wordprocessingml")
  ) {
    return "DOCX";
  }
  if (mimeType.includes("text")) return "TXT";

  return "FILE";
}

function getStatusMeta(status: ParseStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        dot: "#e7c59a",
      };
    case "running":
      return {
        label: "Running",
        dot: "#56c2ff",
      };
    case "completed":
      return {
        label: "Completed",
        dot: "#00ac5c",
      };
    case "failed":
      return {
        label: "Failed",
        dot: "#ff6363",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        dot: "#6a6b6c",
      };
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

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return `${weeks}w ago`;
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return "—";

  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(kb))} KB`;
}

export function RecentFilesCard({
  userId,
  onViewAll,
  onReParse,
}: RecentFilesCardProps) {
  const [files, setFiles] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchRecentFiles() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("resume_files")
        .select(
          "id, original_filename, mime_type, file_size, parse_status, parser_mode, pages_count, created_at"
        )
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch recent files:", error.message);
        setFiles([]);
        setLoading(false);
        return;
      }

      const normalized: RecentFile[] = ((data ?? []) as ResumeFileRow[]).map(
        (file) => ({
          id: file.id,
          name: file.original_filename,
          type: getFileTypeFromMime(file.mime_type),
          size: file.file_size,
          status: normalizeStatus(file.parse_status),
          parser: normalizeParserMode(file.parser_mode),
          pages: file.pages_count,
          created_at: file.created_at,
        })
      );

      setFiles(normalized);
      setLoading(false);
    }

    fetchRecentFiles();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <section
      className="w-full min-w-0"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <style jsx>{`
        @keyframes recent-file-dot-pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.35;
          }
          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .recent-file-animated {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="mb-[14px] flex items-center justify-between gap-3">
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#454647",
            textTransform: "uppercase",
          }}
        >
          RECENT FILES
        </div>

        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-[4px]"
            style={{
              border: "none",
              background: "transparent",
              color: "#6a6b6c",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "var(--font-jetbrains), monospace",
              padding: 0,
            }}
          >
            View all
            <ChevronRight size={13} />
          </button>
        ) : (
          <Link
            href="/files"
            className="inline-flex items-center gap-[4px]"
            style={{
              color: "#6a6b6c",
              fontSize: "12px",
              fontFamily: "var(--font-jetbrains), monospace",
              textDecoration: "none",
            }}
          >
            View all
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {loading ? (
        <RecentFilesSkeleton />
      ) : files.length === 0 ? (
        <RecentFilesEmpty />
      ) : (
        <div className="flex flex-col">
          {files.map((file, index) => (
            <RecentFileRow
              key={file.id}
              file={file}
              isLast={index === files.length - 1}
              onReParse={onReParse}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentFileRow({
  file,
  isLast,
  onReParse,
}: {
  file: RecentFile;
  isLast: boolean;
  onReParse?: (fileId: string) => void;
}) {
  const isActive = file.status === "pending" || file.status === "running";
  const canReParse = file.status === "failed" || file.status === "completed";

  return (
    <div
      className="min-w-0"
      style={{
        minHeight: "50px",
        padding: "10px 0",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-[9px]">
          <div
            className="inline-flex shrink-0 items-center justify-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#1b1c1e",
              color: "#6a6b6c",
            }}
          >
            <FileText size={14} />
          </div>

          <div className="min-w-0">
            <div
              className="truncate"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#f3f3f3",
                lineHeight: 1.2,
              }}
            >
              {file.name || "Untitled file"}
            </div>

            <div
              className="mt-[4px] flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: "11px",
                color: "#6a6b6c",
              }}
            >
              <span>{file.type}</span>
              <span style={{ color: "#333333" }}>•</span>
              <span>{formatFileSize(file.size)}</span>
              <span style={{ color: "#333333" }}>•</span>
              <span>{getParserModeLabel(file.parser)}</span>
              <span style={{ color: "#333333" }}>•</span>
              <span>{file.pages ?? "—"} pages</span>
              <span style={{ color: "#333333" }}>•</span>
              <span>{formatRelativeTime(file.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={file.status} />

          {canReParse && onReParse && (
            <button
              type="button"
              aria-label={`Re-parse ${file.name || "file"}`}
              onClick={() => onReParse(file.id)}
              className="inline-flex items-center justify-center"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#6a6b6c",
                cursor: "pointer",
                transition: "border-color 160ms ease, color 160ms ease",
              }}
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      {isActive && (
        <div
          className="mt-2 overflow-hidden"
          style={{
            height: "3px",
            width: "100%",
            background: "#1b1c1e",
            borderRadius: "2px",
          }}
        >
          <div
            className="recent-file-animated"
            style={{
              width: file.status === "pending" ? "34%" : "62%",
              height: "100%",
              borderRadius: "2px",
              background: file.status === "pending" ? "#e7c59a" : "#56c2ff",
              animation: "recent-file-dot-pulse 1.2s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {file.status === "failed" && (
        <div
          className="mt-2 flex items-center gap-[6px]"
          style={{
            fontSize: "12px",
            color: "#ff6363",
          }}
        >
          <AlertCircle size={13} />
          <span>Parsing failed</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ParseStatus }) {
  const statusMeta = getStatusMeta(status);
  const animated = status === "pending" || status === "running";

  return (
    <span
      className="inline-flex items-center gap-[5px]"
      style={{
        height: "22px",
        padding: "0 8px",
        background: "#1b1c1e",
        borderRadius: "6px",
      }}
    >
      <span
        className={animated ? "recent-file-animated" : undefined}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "999px",
          background: statusMeta.dot,
          flexShrink: 0,
          animation: animated
            ? "recent-file-dot-pulse 1.2s ease-in-out infinite"
            : undefined,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "11px",
          fontWeight: 500,
          color: "#9c9c9d",
        }}
      >
        {statusMeta.label}
      </span>
    </span>
  );
}

function RecentFilesSkeleton() {
  return (
    <div className="flex flex-col">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          style={{
            minHeight: "50px",
            padding: "10px 0",
            borderBottom:
              item === 3 ? "none" : "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-[9px]">
            <SkeletonBlock width="28px" height="28px" radius="8px" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock width="160px" height="13px" marginBottom="7px" />
              <SkeletonBlock width="220px" height="11px" />
            </div>
            <SkeletonBlock width="78px" height="22px" radius="6px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentFilesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <UploadCloud size={30} color="#454647" />

      <p
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "14px",
          fontWeight: 600,
          color: "#6a6b6c",
        }}
      >
        No files uploaded
      </p>

      <p
        style={{
          marginTop: "4px",
          marginBottom: 0,
          fontSize: "13px",
          color: "#454647",
        }}
      >
        Upload your resume to start parsing
      </p>

      <Link
        href="/files"
        className="inline-flex items-center gap-[6px]"
        style={{
          marginTop: "14px",
          height: "34px",
          padding: "0 14px",
          background: "#e6e6e6",
          color: "#2f3031",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          textDecoration: "none",
          boxShadow:
            "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <UploadCloud size={14} />
        Upload Resume
      </Link>
    </div>
  );
}

function SkeletonBlock({
  width,
  height,
  radius = "4px",
  marginBottom,
}: {
  width: string;
  height: string;
  radius?: string;
  marginBottom?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        marginBottom,
        borderRadius: radius,
        background: "#1b1c1e",
      }}
    />
  );
}

export default RecentFilesCard;