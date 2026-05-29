"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ParserMode,
    ParserModeSelector,
} from "./parser-mode-selector";
import { ParseProgressBar } from "./parse-progress-bar";
import type { ParserStatus } from "./parser-status-badge";

type UploadFileDialogProps = {
    plan?: string | null;
};

type Phase = "select" | "progress";

export function UploadFileDialog({ plan }: UploadFileDialogProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [open, setOpen] = useState(false);
    const [phase, setPhase] = useState<Phase>("select");
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<ParserMode>("nano");

    const [jobId, setJobId] = useState<string | null>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [status, setStatus] = useState<ParserStatus>("idle");
    const [progress, setProgress] = useState(0);
    const [label, setLabel] = useState("Waiting to start");
    const [error, setError] = useState<string | null>(null);

    const isBusy = status === "pending" || status === "running";

    function resetDialog() {
        setPhase("select");
        setFile(null);
        setMode("nano");
        setJobId(null);
        setResumeId(null);
        setStatus("idle");
        setProgress(0);
        setLabel("Waiting to start");
        setError(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    function validateFile(nextFile: File) {
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];

        const maxSize = 15 * 1024 * 1024;

        if (!allowed.includes(nextFile.type)) {
            return "Only PDF, DOC, DOCX, or TXT files are supported.";
        }

        if (nextFile.size > maxSize) {
            return "File size must be less than 15MB.";
        }

        return null;
    }

    function handleFile(nextFile: File) {
        const validationError = validateFile(nextFile);

        if (validationError) {
            setError(validationError);
            setFile(null);
            return;
        }

        setError(null);
        setFile(nextFile);
    }

    async function startUploadAndParse() {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setPhase("progress");
        setStatus("pending");
        setProgress(8);
        setLabel("Uploading file to storage...");
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("parserMode", mode);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json().catch(() => null);

            if (!uploadResponse.ok) {
                throw new Error(uploadData?.error || "Upload failed.");
            }

            const fileId =
                uploadData?.fileId ||
                uploadData?.id ||
                uploadData?.file?.id ||
                uploadData?.data?.id;

            if (!fileId) {
                throw new Error("Upload succeeded but file id was not returned.");
            }

            setStatus("pending");
            setProgress(22);
            setLabel("Starting parse job...");

            const parseResponse = await fetch("/api/parse/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    mode,
                }),
            });

            const parseData = await parseResponse.json().catch(() => null);

            if (!parseResponse.ok) {
                throw new Error(parseData?.error || "Failed to start parse job.");
            }

            const nextJobId = parseData?.jobId || parseData?.id || parseData?.job?.id;

            if (!nextJobId) {
                throw new Error("Parse started but job id was not returned.");
            }

            setJobId(nextJobId);
            setStatus("running");
            setProgress(35);
            setLabel("Parser is extracting resume data...");
        } catch (err) {
            setStatus("failed");
            setProgress(100);
            setLabel("Parse flow failed.");
            setError(err instanceof Error ? err.message : "Something went wrong.");
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

                    let nextResumeId =
                        data?.resumeId || data?.resume_id || data?.result?.resumeId;

                    if (!nextResumeId) {
                        const resultResponse = await fetch(`/api/parse/result/${jobId}`);
                        const resultData = await resultResponse.json().catch(() => null);
                        nextResumeId =
                            resultData?.resumeId ||
                            resultData?.resume_id ||
                            resultData?.resume?.id;
                    }

                    if (nextResumeId) {
                        setResumeId(nextResumeId);
                        setTimeout(() => {
                            router.push(`/editor/${nextResumeId}`);
                        }, 900);
                    } else {
                        router.refresh();
                    }

                    return;
                }

                if (nextStatus === "failed") {
                    setStatus("failed");
                    setProgress(100);
                    setLabel("Parsing failed.");
                    setError(data?.error || data?.message || "Parser failed.");
                    return;
                }

                if (nextStatus === "cancelled") {
                    setStatus("cancelled");
                    setProgress(100);
                    setLabel("Parse job cancelled.");
                    return;
                }

                setStatus("running");
                setProgress(
                    Math.max(
                        35,
                        Math.min(
                            95,
                            Number(data?.progress || data?.percent || progress + 8)
                        )
                    )
                );
                setLabel(data?.label || "Parser is extracting resume data...");
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
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (isBusy) return;
                setOpen(value);
                if (!value) resetDialog();
            }}
        >
            <DialogTrigger
                className={cn(
                    "inline-flex h-10 w-full items-center justify-center rounded-lg bg-kv-cta-bg px-4 text-kv-cta-text hover:bg-white lg:w-auto",
                    "whitespace-nowrap",
                    "font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em]",
                    "shadow-[0_3px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]",
                    "active:translate-y-[2px] active:shadow-none"
                )}
            >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload File
            </DialogTrigger>

            <DialogContent className="max-h-[92vh] overflow-y-auto border-kv-border-soft bg-kv-surface-1 p-0 text-kv-text-primary sm:max-w-3xl">                <DialogHeader className="border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="font-jetbrains text-[10px] uppercase tracking-[0.18em] text-kv-text-disabled">
                            UPLOAD_WORKFLOW
                        </p>
                        <DialogTitle className="mt-1 text-[18px] font-semibold">
                            Upload File
                        </DialogTitle>
                    </div>
                </div>
            </DialogHeader>

                <div className="p-5">
                    {phase === "select" ? (
                        <div className="space-y-5">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    const droppedFile = event.dataTransfer.files?.[0];
                                    if (droppedFile) handleFile(droppedFile);
                                }}
                                className={cn(
                                    "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl",
                                    "border border-dashed border-white/10 bg-[#07080a] p-6 text-center",
                                    "transition hover:border-kv-accent-blue/40 hover:bg-kv-accent-blue/5"
                                )}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    className="hidden"
                                    onChange={(event) => {
                                        const selected = event.target.files?.[0];
                                        if (selected) handleFile(selected);
                                    }}
                                />

                                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-kv-surface-2">
                                    {file ? (
                                        <FileText className="h-5 w-5 text-kv-accent-green" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-kv-accent-blue" />
                                    )}
                                </div>

                                <h3 className="mt-4 text-[17px] font-semibold text-kv-text-primary">
                                    {file ? file.name : "Drop resume file here"}
                                </h3>

                                <p className="mt-2 max-w-md text-[13px] leading-6 text-kv-text-muted">
                                    {file
                                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected.`
                                        : "Drag and drop PDF, DOC, DOCX, or TXT file, or click to browse."}
                                </p>

                                <p className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-jetbrains text-[10px] uppercase tracking-[0.12em] text-kv-text-disabled">
                                    Max 15MB • PDF / DOC / DOCX / TXT
                                </p>
                            </div>

                            {error ? (
                                <p className="rounded-lg border border-kv-accent-red/25 bg-kv-accent-red/10 p-3 text-[13px] text-[#ff8c8c]">
                                    {error}
                                </p>
                            ) : null}

                            <ParserModeSelector
                                value={mode}
                                onChange={setMode}
                                plan={plan}
                            />

                            <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-kv-surface-2 px-4 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em] text-kv-text-secondary transition hover:bg-kv-surface-4 hover:text-kv-text-primary"
                                >
                                    <X className="mr-2 h-3.5 w-3.5" />
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={!file}
                                    onClick={startUploadAndParse}
                                    className={cn(
                                        "inline-flex h-10 items-center justify-center rounded-lg bg-kv-cta-bg px-5 text-kv-cta-text",
                                        "font-jetbrains text-[11px] font-semibold uppercase tracking-[0.1em]",
                                        "shadow-[0_3px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]",
                                        "transition hover:bg-white active:translate-y-[2px] active:shadow-none",
                                        "disabled:pointer-events-none disabled:opacity-50"
                                    )}
                                >
                                    <Upload className="mr-2 h-3.5 w-3.5" />
                                    Start Parse
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
                                setPhase("select");
                                setStatus("idle");
                                setProgress(0);
                                setLabel("Waiting to start");
                                setError(null);
                                setJobId(null);
                                setResumeId(null);
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}