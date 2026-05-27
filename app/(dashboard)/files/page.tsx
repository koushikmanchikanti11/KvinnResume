"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Search, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/pixel/page-header";
import { PixelCard } from "@/components/ui/pixel/pixel-card";
import { EmptyState } from "@/components/ui/pixel/empty-state";
import { UploadDropzone } from "@/components/files/upload-dropzone";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ParserModeSelector, type ParserMode } from "@/components/files/parser-mode-selector";
import { ParserStatusBadge } from "@/components/files/parser-status-badge";
import { ParseProgressBar } from "@/components/files/parse-progress-bar";
import { useParseJob } from "@/hooks/use-parse-job";

// ────────────────────────────────────────────────────
// Upload + Parse Flow States
// ────────────────────────────────────────────────────
type FlowStep = "idle" | "upload" | "select_mode" | "parsing" | "done";

export default function FilesPage() {
  const router = useRouter();

  // ── File table state ──
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Upload + parse flow state ──
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [parseMode, setParseMode] = useState<ParserMode>("nano");

  // ── Upload modal (for header button) ──
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // ── Parse modal (for existing file table rows) ──
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [fileToParse, setFileToParse] = useState<any>(null);
  const [isStartingTableParse, setIsStartingTableParse] = useState(false);

  // ── Parse hook ──
  const { startParse, status: parseStatus, progress, label, error: parseError, resumeId, cancel, reset: resetParseJob } = useParseJob();

  // ────────────────────────────────────────────────────
  // Fetch files list
  // ────────────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
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
      (f) => f.parse_status === "running" || f.parse_status === "parsing_complete"
    );
    if (!hasPendingFiles) return;

    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [files, fetchFiles]);

  // ────────────────────────────────────────────────────
  // Redirect when parse completes and resumeId is available
  // ────────────────────────────────────────────────────
  useEffect(() => {
    if (parseStatus === "completed" && resumeId) {
      // Small delay so the user sees the "100% COMPLETE" state briefly
      const timeout = setTimeout(() => {
        router.push(`/editor/${resumeId}`);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [parseStatus, resumeId, router]);

  // ────────────────────────────────────────────────────
  // Upload flow: user drops a file via the inline dropzone
  // ────────────────────────────────────────────────────
  const handleInlineUploadSuccess = (data: any) => {
    setUploadedFile(data);
    setParseMode("nano");
    setFlowStep("select_mode");
    fetchFiles();
  };

  // Upload flow: user drops a file via the header modal
  const handleModalUploadSuccess = (data: any) => {
    setIsUploadModalOpen(false);
    setUploadedFile(data);
    setParseMode("nano");
    setFlowStep("select_mode");
    fetchFiles();
  };

  // ────────────────────────────────────────────────────
  // Start parse (inline flow — from the upload section)
  // ────────────────────────────────────────────────────
  const handleInlineStartParse = async () => {
    if (!uploadedFile) return;
    const fileId = uploadedFile.id || uploadedFile.fileId;
    setFlowStep("parsing");
    await startParse(fileId, parseMode);
  };

  // ────────────────────────────────────────────────────
  // Start parse (table flow — for existing file rows)
  // ────────────────────────────────────────────────────
  const handleTableStartParse = async () => {
    if (!fileToParse) return;
    const fileId = fileToParse.id || fileToParse.fileId;
    setIsStartingTableParse(true);
    setParseModalOpen(false);
    setUploadedFile(fileToParse);
    setFlowStep("parsing");
    await startParse(fileId, parseMode);
    setIsStartingTableParse(false);
  };

  // ────────────────────────────────────────────────────
  // Cancel / Reset
  // ────────────────────────────────────────────────────
  const handleCancel = async () => {
    await cancel();
    resetFlow();
    fetchFiles();
  };

  const resetFlow = () => {
    resetParseJob();
    setFlowStep("idle");
    setUploadedFile(null);
    setParseMode("nano");
  };

  // ────────────────────────────────────────────────────
  // Delete file
  // ────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("File deleted");
        fetchFiles();
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  // ────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <PageHeader
        title="Source Files"
        description="Upload and manage your source resumes and data files."
        action={
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-kv-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                className="h-9 w-64 bg-kv-surface-2 border border-kv-border-soft rounded-lg pl-9 pr-3 text-[13px] text-kv-text-primary focus:outline-none focus:border-kv-border-mid transition-colors"
              />
            </div>
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger render={
                <Button className="h-9 bg-kv-cta-bg text-kv-cta-text hover:bg-white font-jetbrains text-[12px] uppercase tracking-wider border-none shadow-[rgba(0,0,0,0.4)_0px_1.5px_0.5px_2.5px,rgb(0,0,0)_0px_0px_0.5px_1px,rgba(0,0,0,0.25)_0px_2px_1px_1px_inset,rgba(255,255,255,0.2)_0px_1px_1px_1px_inset]" />
              }>
                <Upload className="w-3.5 h-3.5 mr-2" />
                Upload File
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-kv-surface border-kv-border-soft">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-kv-text-primary">Upload Document</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <UploadDropzone onUploadSuccess={handleModalUploadSuccess} />
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* ═══════════════════════════════════════════════
          UPLOAD + PARSE FLOW SECTION (top of page)
          ═══════════════════════════════════════════════ */}

      {/* Step: idle — show drop zone */}
      {flowStep === "idle" && (
        <PixelCard className="p-6 border border-kv-border-soft">
          <UploadDropzone onUploadSuccess={handleInlineUploadSuccess} />
        </PixelCard>
      )}

      {/* Step: select_mode — pick parser mode */}
      {flowStep === "select_mode" && uploadedFile && (
        <PixelCard className="p-6 border border-kv-border-soft">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-sm text-[#f3f3f3] uppercase tracking-wider">
                  Select Parse Mode
                </h3>
                <p className="text-xs text-[#9c9c9d] mt-1">
                  File: <span className="text-[#f3f3f3] font-medium">{uploadedFile.original_filename || uploadedFile.filename}</span>
                </p>
              </div>
              <button
                onClick={resetFlow}
                className="text-xs font-mono text-[#9c9c9d] hover:text-[#ff6363] transition-colors uppercase"
              >
                Cancel
              </button>
            </div>

            <ParserModeSelector selectedMode={parseMode} onSelect={setParseMode} />

            <div className="flex justify-end">
              <Button
                onClick={handleInlineStartParse}
                className="bg-kv-cta-bg text-kv-cta-text hover:bg-white font-jetbrains text-[12px] uppercase tracking-wider"
              >
                Parse Resume
              </Button>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Step: parsing — show progress bar */}
      {flowStep === "parsing" && (
        <div className="flex flex-col gap-4">
          <ParseProgressBar
            status={parseStatus}
            progress={progress}
            label={label}
            onCancel={handleCancel}
          />

          {/* Failure actions */}
          {parseStatus === "failed" && (
            <div className="flex items-center gap-3 pl-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-[#101010] border-white/10 text-[#f3f3f3] hover:bg-white/5"
                onClick={() => {
                  resetParseJob();
                  setFlowStep("select_mode");
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-[#101010] border-white/10 text-[#e7c59a] hover:bg-white/5"
                onClick={() => {
                  resetParseJob();
                  setParseMode("nano_pro");
                  setFlowStep("select_mode");
                }}
              >
                Use Nano Pro
              </Button>
              <button
                onClick={resetFlow}
                className="text-xs font-mono text-[#9c9c9d] hover:text-[#f3f3f3] transition-colors ml-auto"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          EXISTING FILES TABLE (untouched logic)
          ═══════════════════════════════════════════════ */}
      <PixelCard className="p-0 border border-kv-border-soft overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-kv-text-muted" />
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No files uploaded yet"
            description="Upload your first resume, job description, or cover letter to begin parsing."
            action={
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="h-9 bg-kv-surface-2 text-kv-text-primary border border-kv-border-soft hover:bg-kv-surface-4 text-[13px]"
              >
                Browse Files
              </Button>
            }
            className="border-none rounded-none h-full"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-kv-border-soft bg-kv-surface-2">
                  <th className="py-3 px-4 font-mono text-[11px] text-kv-text-muted uppercase tracking-wider">Filename</th>
                  <th className="py-3 px-4 font-mono text-[11px] text-kv-text-muted uppercase tracking-wider">Size</th>
                  <th className="py-3 px-4 font-mono text-[11px] text-kv-text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-mono text-[11px] text-kv-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-kv-border-soft hover:bg-kv-surface-2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-kv-text-muted" />
                        <span className="font-ui text-sm text-kv-text-primary">{file.original_filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-kv-text-muted">
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-3 px-4">
                      <ParserStatusBadge status={file.parse_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {file.parse_status !== "completed" && file.parse_status !== "running" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-kv-surface border-kv-border-soft text-kv-text-primary"
                            onClick={() => {
                              setFileToParse(file);
                              setParseMode("nano");
                              setParseModalOpen(true);
                            }}
                          >
                            Parse
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(file.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PixelCard>

      {/* ═══════════════════════════════════════════════
          Parse Mode Modal (for existing file table rows)
          ═══════════════════════════════════════════════ */}
      <Dialog open={parseModalOpen} onOpenChange={setParseModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-kv-surface border-kv-border-soft">
          <DialogHeader>
            <DialogTitle className="font-pixel text-kv-text-primary">Parse Resume</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-6">
            <p className="text-sm text-kv-text-muted">
              Select the parsing engine for{" "}
              <span className="text-kv-text-primary font-medium">
                {fileToParse?.original_filename || fileToParse?.filename}
              </span>
              .
            </p>

            <ParserModeSelector selectedMode={parseMode} onSelect={setParseMode} />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setParseModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-kv-cta-bg text-kv-cta-text"
                onClick={handleTableStartParse}
                disabled={isStartingTableParse}
              >
                {isStartingTableParse ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...
                  </>
                ) : (
                  "Start Parsing"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
