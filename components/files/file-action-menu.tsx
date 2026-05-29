"use client";

import { useEffect, useState } from "react";
import { Download, MoreHorizontal, RefreshCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ParserMode,
  ParserModeSelector,
} from "./parser-mode-selector";
import { ParseProgressBar } from "./parse-progress-bar";
import type { ParserStatus } from "./parser-status-badge";

type FileActionMenuProps = {
  fileId: string;
  fileName?: string | null;
  plan?: string | null;
  canDownload?: boolean;
};

export function FileActionMenu({
  fileId,
  fileName,
  plan,
  canDownload = true,
}: FileActionMenuProps) {
  const router = useRouter();

  const [reparseOpen, setReparseOpen] = useState(false);
  const [mode, setMode] = useState<ParserMode>("nano");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<ParserStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Waiting to start");
  const [error, setError] = useState<string | null>(null);

  const isBusy = status === "pending" || status === "running";

  function resetReparse() {
    setMode("nano");
    setJobId(null);
    setStatus("idle");
    setProgress(0);
    setLabel("Waiting to start");
    setError(null);
  }

  async function handleDelete() {
    const ok = window.confirm("Delete this file?");
    if (!ok) return;

    const response = await fetch(`/api/files/${fileId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function startReparse() {
    setStatus("pending");
    setProgress(15);
    setLabel("Starting re-parse job...");
    setError(null);

    try {
      const response = await fetch("/api/parse/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          mode,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to start re-parse.");
      }

      const nextJobId = data?.jobId || data?.id || data?.job?.id;

      if (!nextJobId) {
        throw new Error("Parse started but job id was not returned.");
      }

      setJobId(nextJobId);
      setStatus("running");
      setProgress(35);
      setLabel("Re-parsing resume...");
    } catch (err) {
      setStatus("failed");
      setProgress(100);
      setLabel("Re-parse failed.");
      setError(err instanceof Error ? err.message : "Re-parse failed.");
    }
  }

  useEffect(() => {
    if (!jobId || status !== "running") return;

    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/parse/status?jobId=${jobId}`);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Failed to read parse status.");
        }

        if (cancelled) return;

        const nextStatus = String(data?.status || "").toLowerCase();

        if (nextStatus === "completed") {
          setStatus("completed");
          setProgress(100);
          setLabel("Completed. Redirecting to editor...");

          let resumeId = data?.resumeId || data?.resume_id || data?.result?.resumeId;

          if (!resumeId) {
            const resultResponse = await fetch(`/api/parse/result/${jobId}`);
            const resultData = await resultResponse.json().catch(() => null);
            resumeId =
              resultData?.resumeId ||
              resultData?.resume_id ||
              resultData?.resume?.id;
          }

          if (resumeId) {
            setTimeout(() => {
              router.push(`/editor/${resumeId}`);
            }, 900);
          } else {
            router.refresh();
          }

          return;
        }

        if (nextStatus === "failed") {
          setStatus("failed");
          setProgress(100);
          setLabel("Re-parse failed.");
          setError(data?.error || data?.message || "Parser failed.");
          return;
        }

        if (nextStatus === "cancelled") {
          setStatus("cancelled");
          setProgress(100);
          setLabel("Re-parse cancelled.");
          return;
        }

        setProgress(
          Math.max(35, Math.min(95, Number(data?.progress || progress + 8)))
        );
        setLabel(data?.label || "Re-parsing resume...");
      } catch (err) {
        if (!cancelled) {
          setStatus("failed");
          setProgress(100);
          setLabel("Status polling failed.");
          setError(err instanceof Error ? err.message : "Status polling failed.");
        }
      }
    }

    const interval = setInterval(poll, 2500);
    poll();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId, progress, router, status]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-kv-text-muted outline-none transition hover:bg-white/[0.05] hover:text-kv-text-primary"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          style={{
            width: "220px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "13px",
            padding: "6px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          }}
          className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        >
          <DropdownMenuItem
            disabled={!canDownload}
            onClick={() => {
              if (canDownload) {
                window.location.href = `/api/files/${fileId}/download`;
              }
            }}
            style={{
              padding: "10px 14px",
              color: canDownload ? "#9c9c9d" : "#4b4c4d",
              cursor: canDownload ? "pointer" : "not-allowed",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              if (canDownload) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#f3f3f3";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = canDownload ? "#9c9c9d" : "#4b4c4d";
            }}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setReparseOpen(true)}
            style={{
              padding: "10px 14px",
              color: "#9c9c9d",
              cursor: "pointer",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#f3f3f3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#9c9c9d";
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Re-parse</span>
          </DropdownMenuItem>

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.06)",
              margin: "6px 0",
            }}
          />

          <DropdownMenuItem
            onClick={handleDelete}
            style={{
              padding: "10px 14px",
              color: "#ff8c8c",
              cursor: "pointer",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,99,99,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={reparseOpen}
        onOpenChange={(value) => {
          if (isBusy) return;
          setReparseOpen(value);
          if (!value) resetReparse();
        }}
      >
        <DialogContent className="border-kv-border-soft bg-kv-surface-1 text-kv-text-primary sm:max-w-xl">
          <DialogHeader>
            <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
              RE_PARSE_FILE
            </p>
            <DialogTitle className="text-[18px]">
              {fileName || "Selected file"}
            </DialogTitle>
          </DialogHeader>

          {status === "idle" ? (
            <div className="space-y-4">
              <ParserModeSelector
                value={mode}
                onChange={setMode}
                plan={plan}
              />

              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReparseOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-kv-surface-2 px-4 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-kv-text-secondary transition hover:bg-kv-surface-4 hover:text-kv-text-primary"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={startReparse}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-kv-cta-bg px-5 text-kv-cta-text font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] shadow-[0_3px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition hover:bg-white active:translate-y-[2px] active:shadow-none"
                >
                  Start Re-parse
                </button>
              </div>
            </div>
          ) : (
            <ParseProgressBar
              status={status}
              progress={progress}
              label={label}
              error={error}
              onTryAgain={() => {
                setStatus("idle");
                setProgress(0);
                setLabel("Waiting to start");
                setError(null);
                setJobId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}