"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Braces, Download } from "lucide-react";
import { toast } from "sonner";

type ParsedJsonPreviewProps = {
  data?: unknown;
  title?: string;
  className?: string;
};

function getSectionCount(data: any) {
  if (!data || typeof data !== "object") return 0;

  return Object.keys(data).filter((key) => {
    const value = data[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
}

export function ParsedJsonPreview({
  data,
  title = "Parsed JSON",
  className,
}: ParsedJsonPreviewProps) {
  const [open, setOpen] = useState(false);

  const pretty = useMemo(() => {
    if (!data) return "{}";

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return "{}";
    }
  }, [data]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const cleanFilename = title.replace(/\.[^/.]+$/, "");
      const blob = new Blob([pretty], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cleanFilename}_parsed.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("JSON downloaded successfully");
    } catch {
      toast.error("Failed to download JSON");
    }
  };

  const sectionCount = getSectionCount(data);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/[0.08] bg-kv-surface-2",
        className
      )}
    >
      <div className="flex items-center justify-between transition hover:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex flex-1 items-center gap-3 px-4 py-3 text-left"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-kv-accent-violet/30 bg-kv-accent-violet/10">
              <Braces className="h-4 w-4 text-kv-accent-violet" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-kv-text-primary">
                {title}
              </p>
              <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
                {sectionCount} sections detected
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2 pr-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center rounded-md p-2 text-kv-text-muted hover:bg-white/[0.05] hover:text-white transition"
            title="Download JSON"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setOpen((current) => !current)}
            className="flex items-center justify-center p-2"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 text-kv-text-muted" />
            ) : (
              <ChevronRight className="h-4 w-4 text-kv-text-muted" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/[0.06]">
          <pre className="max-h-[360px] overflow-auto p-4 font-jetbrains text-[11px] leading-relaxed text-kv-text-secondary">
            {pretty}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
