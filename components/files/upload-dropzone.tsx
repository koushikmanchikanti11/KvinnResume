"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParserMode, ParserModeSelector } from "./parser-mode-selector";

interface UploadedFileResponse {
  fileId?: string;
  filename?: string;
  pages_estimate?: number | null;
  message?: string;
  [key: string]: unknown;
}

type UploadDropzoneProps = {
  plan?: string | null;
  defaultMode?: ParserMode;
  maxSizeMb?: number;
  
  // Existing props to maintain compatibility with page.tsx
  onUploadSuccess?: (fileData: UploadedFileResponse) => void;
  onUploadStart?: (file: File, parserMode: ParserMode) => void;
  onUploadError?: (error: Error) => void;
  parserMode?: ParserMode;
  defaultParserMode?: ParserMode;
  onParserModeChange?: (mode: ParserMode) => void;
  showParserModeSelector?: boolean;
  isFreeTier?: boolean;
  disabledParserModes?: ParserMode[];
  endpoint?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
};

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export function UploadDropzone({
  plan,
  defaultMode = "nano",
  maxSizeMb,
  maxSizeMB,
  onUploadSuccess,
  onUploadStart,
  onUploadError,
  endpoint = "/api/upload",
}: UploadDropzoneProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const effectiveMaxSize = maxSizeMb ?? maxSizeMB ?? 15;

  const [mode, setMode] = useState<ParserMode>(defaultMode);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  function validateFile(file: File) {
    const maxSize = effectiveMaxSize * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF, DOCX, DOC, and TXT files are supported in this upload flow.";
    }

    if (file.size > maxSize) {
      return `File is too large. Maximum size is ${effectiveMaxSize}MB.`;
    }

    return null;
  }

  function handleFile(file: File) {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  }

  async function uploadFile() {
    if (!selectedFile) return;

    setError(null);
    onUploadStart?.(selectedFile, mode);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("parserMode", mode); // Keeping this as in user's snippet, though api/upload ignores it right now

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Upload failed");
      }

      onUploadSuccess?.(result);

      startTransition(() => {
        router.refresh();
      });

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      const msg = uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.";
      setError(msg);
      onUploadError?.(uploadError instanceof Error ? uploadError : new Error(msg));
    }
  }

  return (
    <section className="rounded-xl border border-white/[0.08] bg-kv-surface-3 p-4 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)] sm:p-5">
      <ParserModeSelector value={mode} onChange={setMode} plan={plan || "Free"} />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          const file = event.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "mt-5 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition",
          "bg-[#07080a]",
          dragging
            ? "border-kv-accent-blue bg-kv-accent-blue/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.025]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <div
          className={cn(
            "grid h-14 w-14 place-items-center rounded-xl border",
            dragging
              ? "border-kv-accent-blue/40 bg-kv-accent-blue/10"
              : "border-white/10 bg-kv-surface-2"
          )}
        >
          {selectedFile ? (
            <FileText className="h-6 w-6 text-kv-accent-green" />
          ) : (
            <Upload className="h-6 w-6 text-kv-accent-blue" />
          )}
        </div>

        <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-kv-text-primary">
          {selectedFile ? selectedFile.name : "Drop resume file here"}
        </h3>

        <p className="mt-2 max-w-md text-[13px] leading-6 text-kv-text-muted">
          {selectedFile
            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB ready for ${mode} parsing.`
            : "Upload PDF, DOCX, or TXT. File will be stored in Supabase Storage, then parsed using your selected parser mode."}
        </p>

        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-jetbrains text-[10px] uppercase tracking-[0.14em] text-kv-text-disabled">
          Max {effectiveMaxSize}MB • PDF / DOC / DOCX / TXT
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-kv-accent-red/25 bg-kv-accent-red/10 p-3 text-[13px] text-[#ff8c8c]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
          Parser selected:{" "}
          <span className="text-kv-accent-amber">{mode.replace("_", " ")}</span>
        </p>

        <button
          type="button"
          disabled={!selectedFile || isPending}
          onClick={(e) => {
            e.stopPropagation();
            uploadFile();
          }}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-lg px-4",
            "bg-kv-cta-bg text-kv-cta-text",
            "font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em]",
            "shadow-[0_3px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]",
            "transition active:translate-y-[2px] active:shadow-none",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </>
          )}
        </button>
      </div>
    </section>
  );
}
