import { FileText } from "lucide-react";
import { ParserStatusBadge } from "./parser-status-badge";
import { FileActionMenu } from "./file-action-menu";

export type FileRowData = {
  id: string;
  fileName: string;
  size: number | null;
  type: string;
  mode: string;
  status: string;
  pages: number | null;
  updated: string | null;
  storagePath?: string | null;
};

type FileRowProps = {
  file: FileRowData;
  plan?: string | null;
};

function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value = value / 1024;
    index++;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";

  return `${days}d ago`;
}

function normalizeType(type?: string | null) {
  if (!type) return "DOC";

  const value = type.toLowerCase();

  if (value.includes("pdf")) return "PDF";
  if (value.includes("word")) return "DOCX";
  if (value.includes("docx")) return "DOCX";
  if (value.includes("doc")) return "DOC";
  if (value.includes("text") || value.includes("txt")) return "TXT";

  return type.toUpperCase().slice(0, 6);
}

function normalizeMode(mode?: string | null) {
  if (mode === "nano_mini") return "Nano Mini";
  if (mode === "nano_pro") return "Nano Pro";
  if (mode === "auto") return "Auto";
  return "Nano";
}

export function FileTableRow({ file, plan }: FileRowProps) {
  return (
    <tr
      className="group border-b transition-colors hover:bg-white/[0.025]"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <td className="px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border transition-colors group-hover:border-white/15"
            style={{
              background: "#1b1c1e",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <FileText className="h-4 w-4" style={{ color: "#9c9c9d" }} />
          </span>

          <div className="min-w-0">
            <p
              className="truncate text-[14px] font-medium leading-none"
              style={{ color: "#f3f3f3" }}
            >
              {file.fileName}
            </p>
          </div>
        </div>
      </td>

      <td
        className="px-3 py-3.5 font-jetbrains text-[12px]"
        style={{ color: "#9c9c9d" }}
      >
        {formatBytes(file.size)}
      </td>

      <td className="px-3 py-3.5">
        <span
          className="inline-flex rounded-md border px-2 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em]"
          style={{
            color: "#9c9c9d",
            borderColor: "rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {normalizeType(file.type)}
        </span>
      </td>

      <td
        className="px-3 py-3.5 font-jetbrains text-[12px]"
        style={{ color: "#f3f3f3" }}
      >
        {normalizeMode(file.mode)}
      </td>

      <td className="px-3 py-3.5">
        <ParserStatusBadge status={file.status} />
      </td>

      <td
        className="px-3 py-3.5 font-jetbrains text-[12px]"
        style={{ color: "#9c9c9d" }}
      >
        {file.pages ?? "—"}
      </td>

      <td
        className="px-3 py-3.5 font-jetbrains text-[12px]"
        style={{ color: "#9c9c9d" }}
      >
        {formatDate(file.updated)}
      </td>

      <td className="px-4 py-3.5 text-right">
        <FileActionMenu
          fileId={file.id}
          fileName={file.fileName}
          plan={plan}
          canDownload={Boolean(file.storagePath)}
        />
      </td>
    </tr>
  );
}

export function FileMobileCard({ file, plan }: FileRowProps) {
  return (
    <article
      className="rounded-[14px] border p-4"
      style={{
        background: "#111214",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border"
            style={{
              background: "#1b1c1e",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <FileText className="h-4 w-4" style={{ color: "#9c9c9d" }} />
          </span>

          <div className="min-w-0">
            <p
              className="line-clamp-1 text-[14px] font-semibold leading-5"
              style={{ color: "#f3f3f3" }}
            >
              {file.fileName}
            </p>

            <p
              className="mt-1 font-jetbrains text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "#6a6b6c" }}
            >
              {formatBytes(file.size)} • {normalizeType(file.type)}
            </p>
          </div>
        </div>

        <FileActionMenu
          fileId={file.id}
          fileName={file.fileName}
          plan={plan}
          canDownload={Boolean(file.storagePath)}
        />
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-3 border-t pt-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div>
          <p
            className="font-jetbrains text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#6a6b6c" }}
          >
            Mode
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "#f3f3f3" }}>
            {normalizeMode(file.mode)}
          </p>
        </div>

        <div>
          <p
            className="font-jetbrains text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#6a6b6c" }}
          >
            Status
          </p>
          <div className="mt-1">
            <ParserStatusBadge status={file.status} />
          </div>
        </div>

        <div>
          <p
            className="font-jetbrains text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#6a6b6c" }}
          >
            Pages
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "#f3f3f3" }}>
            {file.pages ?? "—"}
          </p>
        </div>

        <div>
          <p
            className="font-jetbrains text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#6a6b6c" }}
          >
            Created
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "#f3f3f3" }}>
            {formatDate(file.updated)}
          </p>
        </div>
      </div>
    </article>
  );
}