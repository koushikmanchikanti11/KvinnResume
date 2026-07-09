"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileText, RotateCcw, X } from "lucide-react";

import UploadDropzone from "./upload-dropzone";
import ParserModeSelector, { type ParserMode } from "./parser-mode-selector";
import ParserStatusBadge, { type ParseStatus } from "./parser-status-badge";
import ParseProgressBar from "./parse-progress-bar";

interface UploadFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: (fileIds: string[]) => void;
    userPlan?: string | null;
    defaultMode?: ParserMode;
}

type QueueItemStatus =
    | "idle"
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";

interface QueueItem {
    localId: string;
    file: File;
    fileId: string | null;
    fileName: string;
    jobId: string | null;
    status: QueueItemStatus;
    progress: number;
    error: string | null;
    resumeId: string | null;
}

interface UploadResponse {
    fileId?: string;
    id?: string;
    fileName?: string;
    original_filename?: string;
}

interface StartParseResponse {
    jobId?: string;
    id?: string;
}

interface ParseStatusResponse {
    status?: ParseStatus | string;
    progress?: number;
    resumeId?: string | null;
    resume_id?: string | null;
    result?: {
        resumeId?: string | null;
        resume_id?: string | null;
    } | null;
    metadata?: {
        resume_id?: string | null;
        resumeId?: string | null;
    } | null;
}

const ACTIVE_STATUSES: QueueItemStatus[] = ["pending", "running"];

function createLocalId() {
    return `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function isActiveStatus(status: QueueItemStatus) {
    return ACTIVE_STATUSES.includes(status);
}

function toBadgeStatus(status: QueueItemStatus): ParseStatus {
    return status;
}

function normalizeStatus(status: string | undefined | null): QueueItemStatus {
    if (status === "pending") return "pending";
    if (status === "running") return "running";
    if (status === "completed") return "completed";
    if (status === "failed") return "failed";
    if (status === "cancelled") return "cancelled";

    return "pending";
}

function clampProgress(value: unknown) {
    if (typeof value !== "number" || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
}

function getModeCreditCost(mode: ParserMode) {
    if (mode === "nano") return 7;
    if (mode === "nano_mini") return 10;
    if (mode === "nano_pro") return 25;
    return 30;
}

function getResumeIdFromStatus(data: ParseStatusResponse) {
    return (
        data.resumeId ??
        data.resume_id ??
        data.result?.resumeId ??
        data.result?.resume_id ??
        data.metadata?.resume_id ??
        data.metadata?.resumeId ??
        null
    );
}

export function UploadFileDialog({
    isOpen,
    onClose,
    onUploadComplete,
    userPlan,
    defaultMode = "nano",
}: UploadFileDialogProps) {
    const router = useRouter();

    const [parserMode, setParserMode] = useState<ParserMode>(defaultMode);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [closeWarning, setCloseWarning] = useState(false);
    const [resumeId, setResumeId] = useState<string | null>(null);

    const pollTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
        new Map()
    );

    const hasActiveTransfers = queue.some((item) => isActiveStatus(item.status));
    const hasQueuedFiles = queue.length > 0;

    const uploadDisabled =
        queue.length === 0 ||
        queue.every((item) => item.status !== "idle" && item.status !== "failed");

    const creditEstimate = useMemo(() => {
        return queue.length * getModeCreditCost(parserMode);
    }, [queue.length, parserMode]);

    useEffect(() => {
        if (!isOpen) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                requestClose();
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, hasActiveTransfers]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) return;

        stopAllPolling();
        setQueue([]);
        setCloseWarning(false);
        setResumeId(null);
    }, [isOpen]);

    function updateQueueItem(
        localId: string,
        patch: Partial<Omit<QueueItem, "localId">>
    ) {
        setQueue((current) =>
            current.map((item) =>
                item.localId === localId ? { ...item, ...patch } : item
            )
        );
    }

    function removeQueueItem(localId: string) {
        setQueue((current) => current.filter((item) => item.localId !== localId));
    }

    function stopPolling(localId: string) {
        const timer = pollTimersRef.current.get(localId);

        if (timer) {
            clearInterval(timer);
            pollTimersRef.current.delete(localId);
        }
    }

    function stopAllPolling() {
        for (const timer of pollTimersRef.current.values()) {
            clearInterval(timer);
        }

        pollTimersRef.current.clear();
    }

    function requestClose() {
        if (hasActiveTransfers) {
            setCloseWarning(true);
            return;
        }

        onClose();
    }

    function confirmForceClose() {
        stopAllPolling();
        setCloseWarning(false);
        onClose();
    }

    function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) {
            requestClose();
        }
    }

    function handleFilesSelected(files: File[]) {
        const nextItems: QueueItem[] = files.map((file) => ({
            localId: createLocalId(),
            file,
            fileId: null,
            fileName: file.name,
            jobId: null,
            status: "idle",
            progress: 0,
            error: null,
            resumeId: null,
        }));

        setQueue((current) => [...current, ...nextItems]);
    }

    async function startUploadForItem(item: QueueItem) {
        try {
            updateQueueItem(item.localId, {
                status: "running",
                progress: 10,
                error: null,
            });

            const formData = new FormData();
            formData.append("file", item.file);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Upload failed");
            }

            const uploadData = (await uploadResponse.json()) as UploadResponse;

            const fileId = uploadData.fileId ?? uploadData.id ?? null;
            const fileName =
                uploadData.fileName ?? uploadData.original_filename ?? item.file.name;

            if (!fileId) {
                throw new Error("Upload response missing fileId");
            }

            updateQueueItem(item.localId, {
                fileId,
                fileName,
                status: "pending",
                progress: 25,
            });

            const parseResponse = await fetch("/api/parse/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    mode: parserMode,
                }),
            });

            if (!parseResponse.ok) {
                throw new Error("Failed to start parse job");
            }

            const parseData = (await parseResponse.json()) as StartParseResponse;
            const jobId = parseData.jobId ?? parseData.id ?? null;

            if (!jobId) {
                throw new Error("Parse response missing jobId");
            }

            updateQueueItem(item.localId, {
                jobId,
                status: "running",
                progress: 35,
            });

            startPollingStatus({
                localId: item.localId,
                fileId,
                jobId,
            });
        } catch (error) {
            console.error("Upload/parse pipeline failed:", error);

            updateQueueItem(item.localId, {
                status: "failed",
                progress: 100,
                error:
                    error instanceof Error
                        ? error.message
                        : "Upload or parsing failed",
            });
        }
    }

    function startPollingStatus({
        localId,
        fileId,
        jobId,
    }: {
        localId: string;
        fileId: string;
        jobId: string;
    }) {
        stopPolling(localId);

        async function pollOnce() {
            try {
                // FIXED: /api/parse/status is a flat route — jobId must be a query param,
                // not a path segment (there is no /api/parse/status/[jobId]/route.ts).
                const response = await fetch(`/api/parse/status?jobId=${jobId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch parse status");
                }

                const statusData = (await response.json()) as ParseStatusResponse;
                const nextStatus = normalizeStatus(statusData.status);
                const nextProgress =
                    nextStatus === "completed"
                        ? 100
                        : Math.max(35, clampProgress(statusData.progress));

                updateQueueItem(localId, {
                    status: nextStatus,
                    progress: nextProgress,
                });

                if (nextStatus === "completed") {
                    stopPolling(localId);

                    const nextResumeId = getResumeIdFromStatus(statusData);

                    updateQueueItem(localId, {
                        status: "completed",
                        progress: 100,
                        resumeId: nextResumeId,
                    });

                    try {
                        // FIXED: /api/parse/result/[jobId] is a dynamic route — jobId must be
                        // a path segment, not a query param.
                        await fetch(`/api/parse/result/${jobId}`, {
                            method: "GET",
                            cache: "no-store",
                        });
                    } catch (resultError) {
                        console.warn("Parse result confirmation failed:", resultError);
                    }

                    onUploadComplete?.([fileId]);

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

                if (nextStatus === "failed" || nextStatus === "cancelled") {
                    stopPolling(localId);

                    updateQueueItem(localId, {
                        status: nextStatus,
                        progress: 100,
                        error:
                            nextStatus === "failed"
                                ? "Parsing failed. Try again."
                                : "Parsing cancelled.",
                    });
                }
            } catch (error) {
                console.error("Polling parse status failed:", error);

                stopPolling(localId);

                updateQueueItem(localId, {
                    status: "failed",
                    progress: 100,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to poll parse status",
                });
            }
        }

        pollOnce();

        const timer = setInterval(pollOnce, 2000);
        pollTimersRef.current.set(localId, timer);
    }

    function handleUploadAndParse() {
        const itemsToRun = queue.filter(
            (item) => item.status === "idle" || item.status === "failed"
        );

        for (const item of itemsToRun) {
            startUploadForItem(item);
        }
    }

    function handleRetry(localId: string) {
        const item = queue.find((queueItem) => queueItem.localId === localId);

        if (!item) return;

        stopPolling(localId);

        updateQueueItem(localId, {
            fileId: null,
            jobId: null,
            status: "idle",
            progress: 0,
            error: null,
            resumeId: null,
        });

        startUploadForItem({
            ...item,
            fileId: null,
            jobId: null,
            status: "idle",
            progress: 0,
            error: null,
            resumeId: null,
        });
    }

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Upload resume"
            onMouseDown={handleOverlayClick}
            className="items-end md:items-center"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                zIndex: 200,
                display: "flex",
                justifyContent: "center",
                padding: "24px",
                animation: "upload-dialog-fade 200ms ease",
            }}
        >
            <style>
                {`
          @keyframes upload-dialog-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes upload-dialog-scale {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .upload-dialog-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }

          @media (max-width: 767px) {
            .upload-dialog-panel {
              max-width: 100% !important;
              border-radius: 16px 16px 0 0 !important;
              align-self: flex-end !important;
              max-height: 92vh !important;
            }

            .upload-dialog-overlay {
              padding: 0 !important;
            }
          }
        `}
            </style>

            <div
                className="upload-dialog-panel upload-dialog-animated"
                onMouseDown={(event) => event.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "520px",
                    maxHeight: "88vh",
                    background: "#111214",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    animation:
                        "upload-dialog-scale 240ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        height: "52px",
                        padding: "0 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#ffffff",
                        }}
                    >
                        Upload Resume
                    </h2>

                    <button
                        type="button"
                        aria-label="Close upload dialog"
                        onClick={requestClose}
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#6a6b6c",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 160ms ease, color 160ms ease",
                        }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            event.currentTarget.style.color = "#f3f3f3";
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.background = "transparent";
                            event.currentTarget.style.color = "#6a6b6c";
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="max-md:p-4"
                    style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        overflowY: "auto",
                    }}
                >
                    <UploadDropzone
                        onFileSelect={handleFilesSelected}
                        compact={queue.length > 0}
                        disabled={hasActiveTransfers}
                    />

                    <div>
                        <div
                            style={{
                                fontFamily:
                                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                                fontSize: "11px",
                                fontWeight: 500,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: "#454647",
                                marginBottom: "8px",
                            }}
                        >
                            PARSER MODE
                        </div>

                        <ParserModeSelector
                            value={parserMode}
                            onChange={setParserMode}
                            plan={userPlan}
                            disabled={hasActiveTransfers}
                        />
                    </div>

                    {queue.length > 0 && (
                        <div>
                            <div
                                style={{
                                    fontFamily:
                                        "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    color: "#454647",
                                    marginBottom: "8px",
                                }}
                            >
                                QUEUE
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {queue.map((item) => (
                                    <QueueItemView
                                        key={item.localId}
                                        item={item}
                                        onRemove={() => removeQueueItem(item.localId)}
                                        onRetry={() => handleRetry(item.localId)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {closeWarning && (
                        <div
                            style={{
                                padding: "12px",
                                background: "rgba(255,99,99,0.08)",
                                border: "1px solid rgba(255,99,99,0.25)",
                                borderRadius: "8px",
                            }}
                        >
                            <div
                                className="flex items-center gap-2"
                                style={{
                                    fontSize: "13px",
                                    color: "#ff8c8c",
                                }}
                            >
                                <AlertTriangle size={14} />
                                Upload in progress. Are you sure?
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={confirmForceClose}
                                    style={{
                                        height: "28px",
                                        padding: "0 10px",
                                        borderRadius: "6px",
                                        border: "1px solid rgba(255,99,99,0.25)",
                                        background: "transparent",
                                        color: "#ff8c8c",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Confirm
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCloseWarning(false)}
                                    style={{
                                        height: "28px",
                                        padding: "0 10px",
                                        borderRadius: "6px",
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        background: "transparent",
                                        color: "#9c9c9d",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="max-md:px-4 max-md:py-3"
                    style={{
                        padding: "16px 20px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontFamily:
                                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                            fontSize: "12px",
                            color: hasQueuedFiles ? "#e7c59a" : "#454647",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        {hasQueuedFiles && (
                            <>
                                <span style={{ fontSize: "14px", color: "#e7c59a" }}>◆</span>
                                <span>~{creditEstimate} credits</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={requestClose}
                            style={{
                                height: "34px",
                                padding: "0 14px",
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: "8px",
                                fontSize: "14px",
                                color: "#9c9c9d",
                                cursor: "pointer",
                                transition: "border-color 160ms ease, color 160ms ease",
                            }}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.borderColor =
                                    "rgba(255,255,255,0.20)";
                                event.currentTarget.style.color = "#f3f3f3";
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.borderColor =
                                    "rgba(255,255,255,0.10)";
                                event.currentTarget.style.color = "#9c9c9d";
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={uploadDisabled}
                            onClick={handleUploadAndParse}
                            style={{
                                height: "34px",
                                padding: "0 16px",
                                background: "#e6e6e6",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#2f3031",
                                cursor: uploadDisabled ? "not-allowed" : "pointer",
                                opacity: uploadDisabled ? 0.4 : 1,
                                boxShadow:
                                    "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                                transition: "transform 160ms ease, box-shadow 160ms ease",
                            }}
                            onMouseDown={(event) => {
                                if (uploadDisabled) return;

                                event.currentTarget.style.transform = "translateY(1px)";
                                event.currentTarget.style.boxShadow =
                                    "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                            }}
                            onMouseUp={(event) => {
                                if (uploadDisabled) return;

                                event.currentTarget.style.transform = "translateY(0)";
                                event.currentTarget.style.boxShadow =
                                    "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                            }}
                        >
                            ↑ UPLOAD & PARSE
                        </button>
                    </div>
                </div>

                {resumeId && (
                    <div
                        style={{
                            padding: "10px 20px",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(0,172,92,0.08)",
                            color: "#00ac5c",
                            fontFamily:
                                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                            fontSize: "11px",
                        }}
                    >
                        Parse completed. Redirecting to editor...
                    </div>
                )}
            </div>
        </div>
    );
}

function QueueItemView({
    item,
    onRemove,
    onRetry,
}: {
    item: QueueItem;
    onRemove: () => void;
    onRetry: () => void;
}) {
    const active = isActiveStatus(item.status);
    const badgeStatus = toBadgeStatus(item.status);

    return (
        <div
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
            }}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-[7px]">
                    <FileText
                        size={14}
                        style={{
                            color: "#6a6b6c",
                            flexShrink: 0,
                        }}
                    />

                    <span
                        className="truncate"
                        style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#f3f3f3",
                        }}
                    >
                        {item.fileName}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {item.status === "idle" ? (
                        <>
                            <span
                                style={{
                                    fontFamily:
                                        "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                                    fontSize: "11px",
                                    color: "#454647",
                                }}
                            >
                                Queued
                            </span>

                            <button
                                type="button"
                                aria-label="Remove file"
                                onClick={onRemove}
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "6px",
                                    background: "transparent",
                                    border: "none",
                                    color: "#6a6b6c",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <X size={13} />
                            </button>
                        </>
                    ) : (
                        <ParserStatusBadge status={badgeStatus} />
                    )}
                </div>
            </div>

            {item.status === "running" && item.progress < 35 && (
                <ParseProgressBar
                    status="running"
                    progress={item.progress}
                    label="Uploading…"
                    size="sm"
                />
            )}

            {item.status === "pending" && (
                <ParseProgressBar
                    status="pending"
                    progress={0}
                    label="Queued…"
                    size="sm"
                    showPercentage={false}
                />
            )}

            {item.status === "running" && item.progress >= 35 && (
                <ParseProgressBar
                    status="running"
                    progress={item.progress}
                    label="Parsing…"
                    size="sm"
                />
            )}

            {item.status === "failed" && (
                <div className="flex flex-col gap-2">
                    {item.error && (
                        <p
                            style={{
                                margin: 0,
                                fontSize: "12px",
                                color: "#ff8c8c",
                                lineHeight: 1.4,
                            }}
                        >
                            {item.error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex w-fit items-center gap-[6px]"
                        style={{
                            height: "24px",
                            padding: "0 8px",
                            border: "1px solid rgba(255,99,99,0.25)",
                            borderRadius: "6px",
                            background: "transparent",
                            color: "#ff8c8c",
                            fontSize: "12px",
                            cursor: "pointer",
                        }}
                    >
                        <RotateCcw size={12} />
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}

export default UploadFileDialog;