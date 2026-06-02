"use client";

import { UploadCloud } from "lucide-react";

import FileRow from "./file-row";
import type { FileRowAction, FileRowRecord } from "./file-row";
import type { ParseStatus } from "./parser-status-badge";
import type { ParserMode } from "./parser-mode-selector";

export type FileRecord = FileRowRecord;

interface FileTableProps {
  files: FileRecord[];
  isLoading: boolean;
  onAction: (action: FileRowAction, fileId: string) => void;
}

const headers = [
  "Name",
  "Type",
  "Status",
  "Parser",
  "Pages",
  "Credits",
  "Updated",
  "Actions",
];

const skeletonWidths = [
  "140px",
  "44px",
  "72px",
  "80px",
  "24px",
  "24px",
  "52px",
  "18px",
];

export default function FileTable({
  files,
  isLoading,
  onAction,
}: FileTableProps) {
  return (
    <div
      className="w-full min-w-0 overflow-hidden"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
      }}
    >
      <style>
        {`
          @keyframes file-table-skeleton-pulse {
            0%, 100% {
              opacity: 0.35;
            }
            50% {
              opacity: 0.7;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .file-table-skeleton {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      <div
        className="w-full overflow-x-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.14) transparent",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "940px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                height: "40px",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {headers.map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "0 16px",
                    textAlign: header === "Actions" ? "right" : "left",
                    fontFamily:
                      "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                    fontSize: "11px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#454647",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <FileTableSkeletonRows />
            ) : files.length === 0 ? (
              <FileTableEmptyState />
            ) : (
              files.map((file) => (
                <FileRow key={file.id} file={file} onAction={onAction} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FileTableSkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3].map((rowIndex) => (
        <tr
          key={rowIndex}
          style={{
            height: "52px",
            borderBottom:
              rowIndex === 3
                ? "none"
                : "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {skeletonWidths.map((width, cellIndex) => (
            <td
              key={`${rowIndex}-${cellIndex}`}
              style={{
                padding: "0 16px",
                verticalAlign: "middle",
                textAlign: cellIndex === skeletonWidths.length - 1 ? "right" : "left",
                whiteSpace: "nowrap",
              }}
            >
              <div
                className="file-table-skeleton"
                style={{
                  width,
                  height: "14px",
                  marginLeft:
                    cellIndex === skeletonWidths.length - 1 ? "auto" : 0,
                  background: "#1b1c1e",
                  borderRadius: "5px",
                  animation:
                    "file-table-skeleton-pulse 1.4s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function FileTableEmptyState() {
  return (
    <tr>
      <td
        colSpan={8}
        style={{
          padding: "48px 0",
          textAlign: "center",
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <UploadCloud size={32} color="#454647" />

          <div
            style={{
              marginTop: "14px",
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              fontSize: "12px",
              color: "#454647",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            NO_FILES_FOUND
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "13px",
              color: "#6a6b6c",
            }}
          >
            Upload your resume to get started
          </div>
        </div>
      </td>
    </tr>
  );
}

export type { ParseStatus, ParserMode };