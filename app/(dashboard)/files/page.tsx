"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { ParserModeSelector, type ParserMode } from "@/components/files/parser-mode-selector";
import { ParseProgressBar } from "@/components/files/parse-progress-bar";
import { UploadDropzone } from "@/components/files/upload-dropzone";
import { FileTable } from "@/components/files/file-table";
import { ParsedJsonPreview } from "@/components/files/parsed-json-preview";
import { useParseJob } from "@/hooks/use-parse-job";

// ── Upload + Parse Flow States ──
type FlowStep = "idle" | "upload" | "select_mode" | "parsing" | "done";

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

function getFileName(file: SourceFile | null) {
  return file?.original_filename || file?.filename || "Untitled file";
}

function getFileId(file: SourceFile | null) {
  return file?.id || file?.fileId;
}

export default function FilesPage() {
  const router = useRouter();

  // ── File table state ──
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // ── Upload + parse flow state ──
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [uploadedFile, setUploadedFile] = useState<SourceFile | null>(null);
  const [parseMode, setParseMode] = useState<ParserMode>("nano");

  // ── Parse modal (for existing file table rows) ──
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [fileToParse, setFileToParse] = useState<SourceFile | null>(null);
  const [isStartingTableParse, setIsStartingTableParse] = useState(false);

  // ── JSON Preview Modal state ──
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState<any>(null);
  const [previewFilename, setPreviewFilename] = useState("");

  // ── Parse hook ──
  const {
    startParse,
    status: parseStatus,
    progress,
    label,
    resumeId,
    cancel,
    reset: resetParseJob,
  } = useParseJob();

  // Filter logic combining text search and status
  const filteredFiles = useMemo(() => {
    let result = files;

    const query = searchValue.trim().toLowerCase();
    if (query) {
      result = result.filter((file) => getFileName(file).toLowerCase().includes(query));
    }

    if (selectedStatus !== "all") {
      result = result.filter((file) => {
        const status = (file.parse_status || "uploaded").toLowerCase();
        return status === selectedStatus;
      });
    }

    return result;
  }, [files, searchValue, selectedStatus]);

  const hasActiveParse = flowStep === "parsing";

  // ────────────────────────────────────────────────────
  // Fetch files list
  // ────────────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files ?? []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Auto-poll the file table while any file is actively parsing
  useEffect(() => {
    const hasPendingFiles = files.some(
      (file) => file.parse_status === "running" || file.parse_status === "pending",
    );
    if (!hasPendingFiles) return;

    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [files, fetchFiles]);

  // Redirect when parse completes and resumeId is available
  useEffect(() => {
    if (parseStatus === "completed" && resumeId) {
      const timeout = setTimeout(() => {
        router.push(`/editor/${resumeId}`);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [parseStatus, resumeId, router]);

  // ────────────────────────────────────────────────────
  // Upload flow handlers
  // ────────────────────────────────────────────────────
  const handleInlineUploadSuccess = (data: any) => {
    setUploadedFile(data as SourceFile);
    setParseMode("nano");
    setFlowStep("select_mode");
    fetchFiles();
  };

  const handleInlineStartParse = async () => {
    const fileId = getFileId(uploadedFile);
    if (!fileId) {
      toast.error("Missing file id");
      return;
    }

    setFlowStep("parsing");
    await startParse(fileId, parseMode);
  };

  const handleTableStartParse = async () => {
    const fileId = getFileId(fileToParse);
    if (!fileId) {
      toast.error("Missing file id");
      return;
    }

    setIsStartingTableParse(true);
    setParseModalOpen(false);
    setUploadedFile(fileToParse);
    setFlowStep("parsing");

    try {
      await startParse(fileId, parseMode);
    } finally {
      setIsStartingTableParse(false);
    }
  };

  const resetFlow = () => {
    resetParseJob();
    setFlowStep("idle");
    setUploadedFile(null);
    setParseMode("nano");
  };

  const handleCancel = async () => {
    await cancel();
    resetFlow();
    fetchFiles();
  };

  // ────────────────────────────────────────────────────
  // Preview JSON Modal handler
  // ────────────────────────────────────────────────────
  const handlePreviewJson = (json: any, file: SourceFile) => {
    setPreviewJson(json);
    setPreviewFilename(getFileName(file));
    setIsPreviewOpen(true);
  };

  // ────────────────────────────────────────────────────
  // Delete file
  // ────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file? This action will also cancel any active parse jobs and delete related data.")) return;

    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("File deleted successfully");
        fetchFiles();
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      toast.error("An error occurred during file deletion");
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1180px] mx-auto px-4 py-6 sm:px-6 lg:px-8 text-[#f3f3f3]">
      {/* Page Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
            FILE_WORKSPACE
          </p>

          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-kv-text-primary">
            Source Files
          </h1>

          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-kv-text-muted">
            Upload resumes, choose parser mode, track parsing progress, and
            inspect structured JSON extracted from your documents.
          </p>
        </div>

        {/* Client-side search/filter form */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[420px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kv-text-muted" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search files..."
              className="h-10 w-full rounded-lg border border-kv-border-soft bg-kv-surface-2 pl-9 pr-3 text-[13px] text-kv-text-primary outline-none transition-colors placeholder:text-kv-text-disabled focus:border-kv-border-mid"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-lg border border-kv-border-soft bg-kv-surface-2 px-3 font-jetbrains text-[11px] uppercase tracking-[0.1em] text-kv-text-secondary outline-none transition-colors focus:border-kv-border-mid cursor-pointer"
          >
            <option value="all">All</option>
            <option value="uploaded">Uploaded</option>
            <option value="pending">Pending</option>
            <option value="parsing">Parsing</option>
            <option value="parsed">Parsed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </section>

      {/* Upload + Parser Mode */}
      {flowStep === "idle" && (
        <UploadDropzone
          defaultMode="nano"
          onUploadSuccess={handleInlineUploadSuccess}
          plan="Free"
        />
      )}

      {flowStep === "select_mode" && uploadedFile && (
        <PixelCard className="overflow-hidden border border-white/[0.08] bg-kv-surface-3 p-0 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)] animate-in fade-in zoom-in-95 duration-200">
          <div className="border-b border-white/[0.06] bg-kv-surface-2 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-jetbrains text-[9px] uppercase tracking-[0.2em] text-kv-text-muted font-semibold">
                  Parse Mode
                </p>
                <h2 className="mt-1 truncate text-[16px] font-semibold tracking-[-0.02em] text-kv-text-primary">
                  {getFileName(uploadedFile)}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetFlow}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-white/[0.08] bg-kv-surface-3 px-3 font-jetbrains text-[10px] uppercase tracking-[0.1em] text-kv-text-secondary transition hover:border-[#ff6363]/35 hover:text-[#ff8c8c] active:translate-y-px"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <ParserModeSelector
              value={parseMode}
              onChange={setParseMode}
              plan="Free"
            />
            
            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleInlineStartParse}
                className="h-10 rounded-lg bg-kv-cta-bg px-5 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.08em] text-kv-cta-text transition hover:brightness-110 active:translate-y-px"
              >
                Start Parsing
              </Button>
            </div>
          </div>
        </PixelCard>
      )}

      {flowStep === "parsing" && (
        <div className="flex flex-col gap-4">
          <ParseProgressBar
            status={parseStatus}
            progress={progress}
            className="animate-in fade-in duration-300"
          />

          {parseStatus === "failed" && (
            <div className="flex flex-col gap-3 rounded-xl border border-kv-accent-red/25 bg-kv-accent-red/10 p-4 sm:flex-row sm:items-center animate-in slide-in-from-top-4 duration-300">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-kv-border-soft bg-kv-surface-2 text-xs text-kv-text-primary hover:bg-kv-surface-4"
                onClick={() => {
                  resetParseJob();
                  setFlowStep("select_mode");
                }}
              >
                Try Again
              </Button>

              <button
                type="button"
                onClick={resetFlow}
                className="font-jetbrains text-[11px] uppercase tracking-[0.1em] text-kv-text-secondary transition hover:text-kv-text-primary sm:ml-auto"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Real DB files table */}
      <FileTable
        files={filteredFiles}
        isLoading={isLoading}
        onDelete={handleDelete}
        onReparse={(file) => {
          setFileToParse(file);
          setParseMode("nano");
          setParseModalOpen(true);
        }}
        onPreviewJson={handlePreviewJson}
      />

      {/* Parse Mode Modal for existing file rows */}
      <Dialog open={parseModalOpen} onOpenChange={setParseModalOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-kv-border-soft bg-kv-surface-2 text-kv-text-primary sm:max-w-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-jetbrains text-[13px] uppercase tracking-[0.14em] text-kv-text-primary">
              Parse Resume
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-kv-border-soft bg-kv-surface-3 p-3">
              <p className="font-jetbrains text-[9px] uppercase tracking-[0.18em] text-kv-text-secondary font-semibold">
                Selected File
              </p>
              <p className="mt-1 truncate text-[14px] font-semibold text-kv-text-primary">
                {getFileName(fileToParse)}
              </p>
            </div>

            <ParserModeSelector
              value={parseMode}
              onChange={setParseMode}
              plan="Free"
            />
            
            <div className="flex justify-end gap-2 border-t border-kv-border-soft pt-4">
              <Button
                variant="ghost"
                className="h-9 font-jetbrains text-[11px] uppercase tracking-[0.1em] text-kv-text-secondary hover:bg-white/[0.05] hover:text-kv-text-primary"
                onClick={() => setParseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTableStartParse}
                disabled={isStartingTableParse}
                className="h-9 rounded-lg bg-kv-cta-bg px-4 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.08em] text-kv-cta-text"
              >
                {isStartingTableParse ? "Starting..." : "Start Parsing"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Beautiful parsed JSON visualization modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-kv-border-soft bg-kv-surface-2 text-kv-text-primary sm:max-w-3xl shadow-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-jetbrains text-[13px] uppercase tracking-[0.14em] text-kv-text-primary">
              Parsed JSON Output
            </DialogTitle>
          </DialogHeader>
          <ParsedJsonPreview
            data={previewJson}
            title={previewFilename}
          />
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              className="h-9 font-jetbrains text-[11px] uppercase tracking-[0.1em] text-kv-text-secondary hover:bg-white/[0.05] hover:text-kv-text-primary"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
