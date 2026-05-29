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
  created: string | null;
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
  if (mode === "nano-mini") return "Nano Mini";
  if (mode === "nano-pro") return "Nano Pro";
  if (mode === "auto") return "Auto";
  return "Nano";
}

export function FileTableRow({ file, plan }: FileRowProps) {
  return (
    <tr className="border-b border-white/[0.05] transition hover:bg-white/[0.025]">
      <td className="px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-kv-surface-4">
            <FileText className="h-4 w-4 text-kv-text-muted" />
          </span>

          <span className="truncate text-[14px] font-medium text-kv-text-primary">
            {file.fileName}
          </span>
        </div>
      </td>

      <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted">
        {formatBytes(file.size)}
      </td>

      <td className="px-3 py-3 font-jetbrains text-[12px] uppercase text-kv-text-muted">
        {normalizeType(file.type)}
      </td>

      <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted">
        {normalizeMode(file.mode)}
      </td>

      <td className="px-3 py-3">
        <ParserStatusBadge status={file.status} />
      </td>

      <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted">
        {file.pages ?? "—"}
      </td>

      <td className="px-3 py-3 font-jetbrains text-[12px] text-kv-text-muted">
        {formatDate(file.created)}
      </td>

      <td className="px-4 py-3 text-right">
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
    <div className="rounded-xl border border-white/[0.08] bg-kv-surface-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-kv-surface-4">
            <FileText className="h-4 w-4 text-kv-text-muted" />
          </span>

          <div className="min-w-0">
            <p className="line-clamp-1 text-[14px] font-semibold text-kv-text-primary">
              {file.fileName}
            </p>

            <p className="mt-1 font-jetbrains text-[11px] uppercase tracking-[0.08em] text-kv-text-disabled">
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

      <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
            Mode
          </p>
          <p className="mt-1 text-kv-text-secondary">
            {normalizeMode(file.mode)}
          </p>
        </div>

        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
            Pages
          </p>
          <p className="mt-1 text-kv-text-secondary">{file.pages ?? "—"}</p>
        </div>

        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
            Created
          </p>
          <p className="mt-1 text-kv-text-secondary">
            {formatDate(file.created)}
          </p>
        </div>

        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
            Status
          </p>
          <div className="mt-1">
            <ParserStatusBadge status={file.status} />
          </div>
        </div>
      </div>
    </div>
  );
}