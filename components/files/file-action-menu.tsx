"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ExternalLink,
  RotateCcw,
  Download,
  Trash2,
  Loader2,
  FileJson,
  FileEdit,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

interface FileActionMenuProps {
  file: SourceFile;
  onDelete: (id: string) => void;
  onReparse: (file: SourceFile) => void;
  onPreviewJson: (json: any) => void;
}

export function FileActionMenu({
  file,
  onDelete,
  onReparse,
  onPreviewJson,
}: FileActionMenuProps) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fileId = file.id;
  const isParsed = file.parse_status === "completed";
  const isProcessing = file.parse_status === "pending" || file.parse_status === "running";

  const handleOpenOriginal = async () => {
    if (!file.storage_path) {
      toast.error("Original file storage path not found");
      return;
    }

    setLoadingAction("open");
    try {
      const { data, error } = await supabase.storage
        .from("resume-originals")
        .createSignedUrl(file.storage_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        throw new Error("Failed to get signed URL");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate file preview link");
    } finally {
      setLoadingAction(null);
      setOpen(false);
    }
  };

  const handleFetchParsedJson = async (action: "preview" | "download") => {
    setLoadingAction(action);
    try {
      const { data, error } = await supabase
        .from("parse_jobs")
        .select("parsed_json")
        .eq("resume_file_id", fileId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data?.parsed_json) {
        toast.error("No completed parsed JSON found for this file.");
        return;
      }

      if (action === "preview") {
        onPreviewJson(data.parsed_json);
      } else {
        const formattedJson = JSON.stringify(data.parsed_json, null, 2);
        const blob = new Blob([formattedJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const cleanFilename = (file.original_filename || file.filename || "file").replace(/\.[^/.]+$/, "");
        link.download = `${cleanFilename}_parsed.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("JSON downloaded successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error(action === "preview" ? "Failed to view JSON" : "Failed to download JSON");
    } finally {
      setLoadingAction(null);
      setOpen(false);
    }
  };

  const handleUseInResume = () => {
    if (file.resume_id) {
      router.push(`/editor/${file.resume_id}`);
    } else {
      toast.info("This file hasn't been parsed yet. Please run parsing first.");
    }
    setOpen(false);
  };

  const handleUseForCoverLetter = () => {
    router.push(`/dashboard/ai-chat?fileId=${fileId}&filename=${encodeURIComponent(file.original_filename || "")}`);
    setOpen(false);
  };

  const handleReparse = () => {
    onReparse(file);
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete(fileId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg border border-white/10",
          "bg-kv-surface-2 text-kv-text-muted transition hover:bg-kv-surface-4 hover:text-kv-text-primary"
        )}
        aria-label="Open file actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#111214] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              disabled={isProcessing || loadingAction === "open"}
              onClick={handleOpenOriginal}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-kv-text-secondary transition hover:bg-white/[0.05] hover:text-kv-text-primary disabled:opacity-50"
            >
              {loadingAction === "open" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Open Original
            </button>

            {isParsed && (
              <button
                type="button"
                disabled={loadingAction === "preview"}
                onClick={() => handleFetchParsedJson("preview")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-kv-text-secondary transition hover:bg-white/[0.05] hover:text-kv-text-primary disabled:opacity-50"
              >
                {loadingAction === "preview" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileJson className="h-4 w-4" />
                )}
                Preview JSON
              </button>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleReparse}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-kv-text-secondary transition hover:bg-white/[0.05] hover:text-kv-text-primary disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Re-parse
            </button>

            <div className="my-1 h-px bg-white/[0.06]" />

            <button
              type="button"
              disabled={!file.resume_id}
              onClick={handleUseInResume}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-[#e7c59a] transition hover:bg-[#e7c59a]/10 disabled:opacity-50"
            >
              <FileEdit className="h-4 w-4" />
              Use in Resume
            </button>

            <button
              type="button"
              disabled={!isParsed}
              onClick={handleUseForCoverLetter}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-kv-accent-violet transition hover:bg-kv-accent-violet/10 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Cover Letter
            </button>

            {isParsed && (
              <button
                type="button"
                disabled={loadingAction === "download"}
                onClick={() => handleFetchParsedJson("download")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-kv-accent-blue transition hover:bg-kv-accent-blue/10 disabled:opacity-50"
              >
                {loadingAction === "download" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download JSON
              </button>
            )}

            <div className="my-1 h-px bg-white/[0.06]" />

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-[#ff8c8c] transition hover:bg-kv-accent-red/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
