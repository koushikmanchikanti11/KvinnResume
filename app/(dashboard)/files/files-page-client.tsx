"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, SlidersHorizontal, UploadCloud } from "lucide-react";

import FileTable, { type FileRecord } from "@/components/files/file-table";
import type { FileRowAction } from "@/components/files/file-row";
import UploadDropzone from "@/components/files/upload-dropzone";
import UploadFileDialog from "@/components/files/upload-file-dialog";
import ParsedJsonPreview from "@/components/files/parsed-json-preview";
import ParserStatusBadge, {
    type ParseStatus,
} from "@/components/files/parser-status-badge";
import ParseProgressBar from "@/components/files/parse-progress-bar";
import FileActionMenu from "@/components/files/file-action-menu";
import { Check, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type InitialFileRecord = FileRecord;

type FilesPageClientProps = {
    initialFiles: InitialFileRecord[];
    userPlan: string | null;
    initialQuery?: string;
    initialStatus?: string;
    initialType?: string;
    initialSort?: string;
};

type TypeFilter = "all" | "PDF" | "DOCX" | "TXT";
type SortFilter = "latest" | "oldest" | "name-az" | "name-za";

function formatRelativeTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "recently";

    const diffMs = Date.now() - date.getTime();
    const seconds = Math.max(0, Math.floor(diffMs / 1000));
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;

    return `${weeks}w ago`;
}

function sortFiles(files: FileRecord[], sort: SortFilter) {
    const next = [...files];

    if (sort === "latest") {
        return next.sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    if (sort === "oldest") {
        return next.sort(
            (a, b) =>
                new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
    }

    if (sort === "name-az") {
        return next.sort((a, b) => a.name.localeCompare(b.name));
    }

    return next.sort((a, b) => b.name.localeCompare(a.name));
}

function getStatusMatch(fileStatus: ParseStatus, selectedStatus: string) {
    if (!selectedStatus || selectedStatus === "all") return true;
    return fileStatus === selectedStatus;
}

export default function FilesPageClient({
    initialFiles,
    userPlan,
    initialQuery = "",
    initialStatus = "all",
    initialType = "all",
    initialSort = "latest",
}: FilesPageClientProps) {
    const router = useRouter();

    const [files, setFiles] = useState<FileRecord[]>(initialFiles);
    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState(initialQuery);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>(
        initialType === "PDF" ||
            initialType === "DOCX" ||
            initialType === "TXT"
            ? initialType
            : "all"
    );
    const [statusFilter, setStatusFilter] = useState(initialStatus || "all");
    const [sortFilter, setSortFilter] = useState<SortFilter>(
        initialSort === "oldest" ||
            initialSort === "name-az" ||
            initialSort === "name-za"
            ? initialSort
            : "latest"
    );

    const [uploadOpen, setUploadOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFileId, setPreviewFileId] = useState("");
    const [previewFileName, setPreviewFileName] = useState("");

    const hasUploadedBefore = files.length > 0;

    const filteredFiles = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = files.filter((file) => {
            const matchesSearch = query
                ? file.name.toLowerCase().includes(query)
                : true;

            const matchesType = typeFilter === "all" ? true : file.type === typeFilter;
            const matchesStatus = getStatusMatch(file.status, statusFilter);

            return matchesSearch && matchesType && matchesStatus;
        });

        return sortFiles(filtered, sortFilter);
    }, [files, search, typeFilter, statusFilter, sortFilter]);

    async function refreshFiles() {
        setIsLoading(true);

        try {
            router.refresh();
        } finally {
            window.setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }

    function handleDropzoneSelect(selectedFiles: File[]) {
        if (selectedFiles.length === 0) return;
        setUploadOpen(true);
    }

    async function handleAction(action: FileRowAction, fileId: string) {
        const file = files.find((item) => item.id === fileId);

        if (!file) return;

        if (action === "view") {
            setPreviewFileId(file.id);
            setPreviewFileName(file.name);
            setPreviewOpen(true);
            return;
        }

        if (action === "useInResume") {
            router.push(`/resume?fileId=${fileId}`);
            return;
        }

        if (action === "downloadJson") {
            await downloadParsedJson(file);
            return;
        }

        if (action === "delete") {
            await deleteFile(fileId);
            return;
        }

        if (action === "reParse") {
            await reParseFile(fileId);
        }
    }

    async function reParseFile(fileId: string) {
        setFiles((current) =>
            current.map((file) =>
                file.id === fileId
                    ? {
                        ...file,
                        status: "running",
                        parseProgress: 10,
                    }
                    : file
            )
        );

        try {
            const response = await fetch("/api/parse/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    mode: "nano",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to start parse");
            }

            const data = await response.json();
            const jobId = data.jobId ?? data.id;

            if (!jobId) {
                throw new Error("Parse job id missing");
            }

            pollParseStatus(fileId, jobId);
        } catch (error) {
            console.error("Failed to re-parse file:", error);

            setFiles((current) =>
                current.map((file) =>
                    file.id === fileId
                        ? {
                            ...file,
                            status: "failed",
                            parseProgress: 100,
                        }
                        : file
                )
            );
        }
    }

    function pollParseStatus(fileId: string, jobId: string) {
        const timer = window.setInterval(async () => {
            try {
                const response = await fetch(`/api/parse/status/${jobId}`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Failed to poll parse status");
                }

                const data = await response.json();
                const nextStatus = data.status as ParseStatus;
                const progress =
                    typeof data.progress === "number" ? Math.round(data.progress) : 0;

                setFiles((current) =>
                    current.map((file) =>
                        file.id === fileId
                            ? {
                                ...file,
                                status: nextStatus,
                                parseProgress:
                                    nextStatus === "completed"
                                        ? 100
                                        : nextStatus === "failed" || nextStatus === "cancelled"
                                            ? 100
                                            : progress,
                            }
                            : file
                    )
                );

                if (
                    nextStatus === "completed" ||
                    nextStatus === "failed" ||
                    nextStatus === "cancelled"
                ) {
                    window.clearInterval(timer);

                    if (nextStatus === "completed") {
                        refreshFiles();
                    }
                }
            } catch (error) {
                console.error("Polling failed:", error);
                window.clearInterval(timer);

                setFiles((current) =>
                    current.map((file) =>
                        file.id === fileId
                            ? {
                                ...file,
                                status: "failed",
                                parseProgress: 100,
                            }
                            : file
                    )
                );
            }
        }, 2000);
    }

    async function downloadParsedJson(file: FileRecord) {
        try {
            const response = await fetch(`/api/files/${file.id}/parsed-json`, {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Failed to download JSON");
            }

            const data = await response.json();
            const json = JSON.stringify(data?.data ?? data?.parsed_json ?? data, null, 2);

            const blob = new Blob([json], {
                type: "application/json",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${file.name.replace(/\.[^/.]+$/, "")}_parsed.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download parsed JSON:", error);
        }
    }

    async function deleteFile(fileId: string) {
        const previousFiles = files;

        setFiles((current) => current.filter((file) => file.id !== fileId));

        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete file");
            }
        } catch (error) {
            console.error("Failed to delete file:", error);
            setFiles(previousFiles);
        }
    }

    return (
        <div className="w-full min-w-0 bg-[#040506]">
            {/* Header */}
            <section className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
                <div className="min-w-0">
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            fontWeight: 700,
                            color: "#ffffff",
                            lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                        }}
                    >
                        Files
                    </h1>

                    <p
                        style={{
                            marginTop: "4px",
                            marginBottom: 0,
                            fontSize: "14px",
                            color: "#6a6b6c",
                        }}
                    >
                        Manage your uploaded resume files
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center justify-center gap-[6px] max-md:w-full"
                    style={{
                        height: "34px",
                        padding: "0 14px",
                        background: "#e6e6e6",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#2f3031",
                        cursor: "pointer",
                        boxShadow:
                            "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                        transition: "transform 160ms ease, box-shadow 160ms ease",
                    }}
                    onMouseDown={(event) => {
                        event.currentTarget.style.transform = "translateY(1px)";
                        event.currentTarget.style.boxShadow =
                            "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                    }}
                    onMouseUp={(event) => {
                        event.currentTarget.style.transform = "translateY(0)";
                        event.currentTarget.style.boxShadow =
                            "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                    }}
                >
                    ↑ UPLOAD
                </button>
            </section>

            {/* Filter Bar */}
            <section className="mb-3 flex h-10 items-center gap-2 max-md:h-auto max-md:flex-wrap">
                <div
                    className="relative max-md:flex-1"
                    style={{
                        width: "240px",
                    }}
                >
                    <Search
                        size={14}
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6a6b6c",
                            pointerEvents: "none",
                        }}
                    />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search files…"
                        style={{
                            width: "100%",
                            height: "36px",
                            padding: "0 12px 0 36px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "8px",
                            fontSize: "13px",
                            color: "#f3f3f3",
                            outline: "none",
                            transition: "border-color 160ms ease",
                        }}
                        onFocus={(event) => {
                            event.currentTarget.style.borderColor =
                                "rgba(231,197,154,0.5)";
                        }}
                        onBlur={(event) => {
                            event.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.08)";
                        }}
                    />
                </div>

                <PixelSelect
                    value={typeFilter}
                    options={[
                        { value: "all", label: "Type" },
                        { value: "PDF", label: "PDF" },
                        { value: "DOCX", label: "DOCX" },
                        { value: "TXT", label: "TXT" },
                    ]}
                    onChange={(value) => setTypeFilter(value as TypeFilter)}
                    className="hidden md:block"
                />

                <PixelSelect
                    value={statusFilter}
                    options={[
                        { value: "all", label: "Status" },
                        { value: "idle", label: "Idle" },
                        { value: "pending", label: "Pending" },
                        { value: "running", label: "Running" },
                        { value: "completed", label: "Completed" },
                        { value: "failed", label: "Failed" },
                        { value: "cancelled", label: "Cancelled" },
                    ]}
                    onChange={setStatusFilter}
                    className="hidden md:block"
                />

                <PixelSelect
                    value={sortFilter}
                    options={[
                        { value: "latest", label: "Sort: Latest" },
                        { value: "oldest", label: "Sort: Oldest" },
                        { value: "name-az", label: "Sort: Name A–Z" },
                        { value: "name-za", label: "Sort: Name Z–A" },
                    ]}
                    onChange={(value) => setSortFilter(value as SortFilter)}
                    className="ml-auto"
                />
            </section>

            {/* Dropzone */}
            <section className="mb-5 mt-2">
                <UploadStrip compact={hasUploadedBefore} onClick={() => setUploadOpen(true)} />
            </section>

            {!isLoading && (
                <div
                    style={{
                        marginBottom: "10px",
                        fontFamily:
                            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                        fontSize: "12px",
                        color: "#6a6b6c",
                    }}
                >
                    {filteredFiles.length} files
                </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block">
                <FileTable
                    files={filteredFiles}
                    isLoading={isLoading}
                    onAction={handleAction}
                />
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden">
                {isLoading ? (
                    <MobileFilesSkeleton />
                ) : filteredFiles.length === 0 ? (
                    <MobileFilesEmpty />
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredFiles.map((file) => (
                            <MobileFileCard
                                key={file.id}
                                file={file}
                                onAction={handleAction}
                            />
                        ))}
                    </div>
                )}
            </div>

            <UploadFileDialog
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadComplete={() => {
                    setUploadOpen(false);
                    refreshFiles();
                }}
                userPlan={userPlan}
            />

            <ParsedJsonPreview
                fileId={previewFileId}
                fileName={previewFileName}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
            />
        </div>
    );
}

function MobileFileCard({
    file,
    onAction,
}: {
    file: FileRecord;
    onAction: (action: FileRowAction, fileId: string) => void;
}) {
    const active = file.status === "running" || file.status === "pending";

    return (
        <div
            style={{
                background: "#111214",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "14px",
            }}
        >
            <div className="flex items-center gap-[10px]">
                <FileText size={20} color="#6a6b6c" />

                <div className="min-w-0 flex-1">
                    <div
                        className="truncate"
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#f3f3f3",
                        }}
                    >
                        {file.name}
                    </div>

                    <div
                        style={{
                            marginTop: "2px",
                            fontFamily:
                                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                            fontSize: "12px",
                            color: "#6a6b6c",
                        }}
                    >
                        {file.type} • {file.pages ?? "—"} pages •{" "}
                        {formatRelativeTime(file.updatedAt)}
                    </div>
                </div>

                <ParserStatusBadge status={file.status} />
            </div>

            {active && (
                <div style={{ marginTop: "8px" }}>
                    <ParseProgressBar
                        status={file.status}
                        progress={file.parseProgress ?? 0}
                        size="sm"
                        label={file.status === "pending" ? "Queued…" : "Parsing…"}
                    />
                </div>
            )}

            <div className="mt-[10px] flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onAction("reParse", file.id)}
                    disabled={file.status === "running"}
                    style={{
                        height: "28px",
                        padding: "0 10px",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#9c9c9d",
                        cursor: file.status === "running" ? "not-allowed" : "pointer",
                        opacity: file.status === "running" ? 0.4 : 1,
                    }}
                >
                    Re-parse
                </button>

                <div className="ml-auto">
                    <FileActionMenu
                        fileId={file.id}
                        fileName={file.name}
                        status={file.status}
                        onView={() => onAction("view", file.id)}
                        onReParse={() => onAction("reParse", file.id)}
                        onUseInResume={() => onAction("useInResume", file.id)}
                        onDownloadJson={() => onAction("downloadJson", file.id)}
                        onDelete={() => onAction("delete", file.id)}
                    />
                </div>
            </div>
        </div>
    );
}

function MobileFilesSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {[0, 1, 2].map((item) => (
                <div
                    key={item}
                    style={{
                        height: "92px",
                        background: "#111214",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        padding: "14px",
                    }}
                >
                    <div
                        className="animate-pulse"
                        style={{
                            width: "72%",
                            height: "14px",
                            background: "#1b1c1e",
                            borderRadius: "4px",
                            marginBottom: "10px",
                        }}
                    />

                    <div
                        className="animate-pulse"
                        style={{
                            width: "48%",
                            height: "12px",
                            background: "#1b1c1e",
                            borderRadius: "4px",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

function MobileFilesEmpty() {
    return (
        <div
            className="flex flex-col items-center justify-center text-center"
            style={{
                minHeight: "180px",
                background: "#111214",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "24px",
            }}
        >
            <UploadCloud size={32} color="#454647" />

            <div
                style={{
                    marginTop: "14px",
                    fontFamily:
                        "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: "#454647",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}
            >
                NO_FILES_FOUND
            </div>

            <div
                style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#6a6b6c",
                }}
            >
                Upload your resume to get started
            </div>
        </div>
    );
}

function PixelSelect({
    value,
    options,
    onChange,
    className,
}: {
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    className?: string;
}) {
    const selectedLabel =
        options.find((option) => option.value === value)?.label ?? options[0]?.label;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={className}
                style={{
                    height: "36px",
                    minWidth: "112px",
                    padding: "0 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#9c9c9d",
                    cursor: "pointer",
                    outline: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    transition: "border-color 160ms ease, color 160ms ease",
                }}
                onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    event.currentTarget.style.color = "#f3f3f3";
                }}
                onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    event.currentTarget.style.color = "#9c9c9d";
                }}
            >
                <span>{selectedLabel}</span>
                <ChevronDown size={14} style={{ color: "#6a6b6c" }} />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={6}
                style={{
                    minWidth: "176px",
                    background: "#111214",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "12px",
                    padding: "6px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
                    zIndex: 9999,
                }}
            >
                {options.map((option) => {
                    const selected = option.value === value;

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            style={{
                                height: "34px",
                                padding: "0 10px",
                                borderRadius: "7px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "9px",
                                cursor: "pointer",
                                fontFamily:
                                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: selected ? "#f3f3f3" : "#9c9c9d",
                                background: selected
                                    ? "rgba(255,255,255,0.05)"
                                    : "transparent",
                            }}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.background =
                                    "rgba(255,255,255,0.05)";
                                event.currentTarget.style.color = "#f3f3f3";
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.background = selected
                                    ? "rgba(255,255,255,0.05)"
                                    : "transparent";
                                event.currentTarget.style.color = selected
                                    ? "#f3f3f3"
                                    : "#9c9c9d";
                            }}
                        >
                            <span>{option.label}</span>
                            {selected ? <Check size={14} style={{ color: "#e7c59a" }} /> : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function UploadStrip({
    compact,
    onClick,
}: {
    compact: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full"
            style={{
                position: "relative",
                borderRadius: "12px",
                transition: "border-color 160ms ease, background 160ms ease",
                cursor: "pointer",
                background: "rgba(255,255,255,0.02)",
                border: "1.5px dashed rgba(255,255,255,0.12)",
                padding: compact ? "12px 20px" : "32px",
                textAlign: compact ? "left" : "center",
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = "rgba(231,197,154,0.50)";
                event.currentTarget.style.background = "rgba(231,197,154,0.04)";
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                event.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
        >
            <CornerBracket position="top-left" />
            <CornerBracket position="top-right" />
            <CornerBracket position="bottom-left" />
            <CornerBracket position="bottom-right" />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    minWidth: 0,
                }}
            >
                <UploadCloud size={18} style={{ color: "#6a6b6c", flexShrink: 0 }} />

                <span
                    style={{
                        fontSize: "13px",
                        color: "#6a6b6c",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    Drop files here or click to upload
                </span>

                <span
                    style={{
                        fontSize: "11px",
                        fontFamily:
                            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                        color: "#454647",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    Max 15MB
                </span>
            </div>
        </button>
    );
}

function CornerBracket({
    position,
}: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
    const style: React.CSSProperties = {
        position: "absolute",
        width: "12px",
        height: "12px",
        borderColor: "#e7c59a",
        opacity: 0.4,
        pointerEvents: "none",
    };

    if (position === "top-left") {
        Object.assign(style, {
            top: 0,
            left: 0,
            borderTop: "2px solid #e7c59a",
            borderLeft: "2px solid #e7c59a",
            borderTopLeftRadius: "12px",
        });
    }

    if (position === "top-right") {
        Object.assign(style, {
            top: 0,
            right: 0,
            borderTop: "2px solid #e7c59a",
            borderRight: "2px solid #e7c59a",
            borderTopRightRadius: "12px",
        });
    }

    if (position === "bottom-left") {
        Object.assign(style, {
            bottom: 0,
            left: 0,
            borderBottom: "2px solid #e7c59a",
            borderLeft: "2px solid #e7c59a",
            borderBottomLeftRadius: "12px",
        });
    }

    if (position === "bottom-right") {
        Object.assign(style, {
            bottom: 0,
            right: 0,
            borderBottom: "2px solid #e7c59a",
            borderRight: "2px solid #e7c59a",
            borderBottomRightRadius: "12px",
        });
    }

    return <span aria-hidden="true" style={style} />;
}