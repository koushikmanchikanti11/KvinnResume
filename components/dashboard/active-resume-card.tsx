"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Copy,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  PenLine,
  Trash2,
} from "lucide-react";

interface ActiveResumeCardProps {
  userId: string;
  onUploadClick?: () => void;
  onDelete?: (resumeId: string) => void;
}

interface ResumeData {
  id: string;
  title: string | null;
  updated_at: string;
  published: boolean | null;
  visibility: "public" | "unlisted" | "private" | "draft" | null;
  ats_score: number | null;
  slug: string | null;
  resume_json:
    | {
        basics?: {
          label?: string | null;
          title?: string | null;
        };
      }
    | null;
}

const FILES_ROUTE = "/files";
const EDITOR_ROUTE = "/editor";

const thumbnailBarWidths = [
  "90%",
  "50%",
  "80%",
  "55%",
  "70%",
  "85%",
  "50%",
  "75%",
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const now = Date.now();
  const then = date.getTime();
  const diffMs = Math.max(0, now - then);

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  if (years === 1) return "1 year ago";

  return `${years} years ago`;
}

function getVisibilityState(
  published: boolean | null,
  visibility: ResumeData["visibility"]
): { color: string; label: string } {
  if (published || visibility === "public") {
    return { color: "#00ac5c", label: "Published" };
  }

  if (visibility === "unlisted") {
    return { color: "#e7c59a", label: "Unlisted" };
  }

  if (visibility === "private") {
    return { color: "#6a6b6c", label: "Private" };
  }

  return { color: "#454647", label: "Draft" };
}

function getAtsScoreColor(score: number): string {
  if (score >= 80) return "#00ac5c";
  if (score >= 60) return "#e7c59a";
  return "#ff6363";
}

export default function ActiveResumeCard({
  userId,
  onUploadClick,
  onDelete,
}: ActiveResumeCardProps) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchResume() {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("resumes")
        .select(
          "id, title, updated_at, published, visibility, ats_score, slug, resume_json"
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Failed to fetch active resume:", error.message);
        setResume(null);
      } else {
        setResume((data as ResumeData | null) ?? null);
      }

      setLoading(false);
    }

    fetchResume();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleCopyPublicLink() {
    if (!resume?.slug) return;

    const url = `${window.location.origin}/r/${resume.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");

      window.setTimeout(() => {
        setCopyState("idle");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy public link:", error);
    }
  }

  async function handleDownloadPdf() {
    if (!resume) return;

    window.open(`${EDITOR_ROUTE}/${resume.id}/export`, "_blank", "noopener,noreferrer");
    setMenuOpen(false);
  }

  if (loading) {
    return <ActiveResumeSkeleton />;
  }

  if (!resume) {
    return <ActiveResumeEmptyState onUploadClick={onUploadClick} />;
  }

  const title = resume.title?.trim() || "Untitled Resume";
  const roleLabel =
    resume.resume_json?.basics?.label ||
    resume.resume_json?.basics?.title ||
    "Resume workspace";

  const visibility = getVisibilityState(resume.published, resume.visibility);
  const editorHref = `${EDITOR_ROUTE}/${resume.id}`;
  const previewHref = `${EDITOR_ROUTE}/${resume.id}/preview`;

  return (
    <section
      className="w-full min-w-0"
      style={{
        minHeight: "132px",
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
        transition: "border-color 160ms ease",
      }}
    >
      <div className="flex min-w-0 flex-row gap-4">
        <div className="min-w-0 flex-1">
          <div
            style={{
              marginBottom: "12px",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#454647",
            }}
          >
            ACTIVE RESUME
          </div>

          <h2
            className="truncate"
            style={{
              maxWidth: "100%",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#f3f3f3",
              margin: 0,
            }}
          >
            {title}
          </h2>

          <p
            className="truncate"
            style={{
              marginTop: "2px",
              marginBottom: 0,
              fontSize: "13px",
              fontWeight: 400,
              color: "#6a6b6c",
            }}
          >
            {roleLabel}
          </p>

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            style={{ marginTop: "12px" }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: "12px",
                color: "#6a6b6c",
              }}
            >
              Edited {formatRelativeTime(resume.updated_at)}
            </span>

            <span className="inline-flex items-center gap-[5px]">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "999px",
                  background: visibility.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "#9c9c9d",
                }}
              >
                {visibility.label}
              </span>
            </span>
          </div>

          {resume.ats_score !== null && resume.ats_score !== undefined && (
            <div style={{ marginTop: "8px" }}>
              <span
                className="inline-flex items-center gap-[5px]"
                style={{
                  height: "22px",
                  padding: "0 8px",
                  background: "#1b1c1e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "10px",
                    color: "#454647",
                  }}
                >
                  ATS
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: getAtsScoreColor(resume.ats_score),
                  }}
                >
                  {resume.ats_score}
                </span>
              </span>
            </div>
          )}

          <div className="mt-4 flex min-w-0 gap-2">
            <Link
              href={editorHref}
              className="inline-flex flex-1 items-center justify-center gap-[6px] md:flex-none"
              style={{
                height: "34px",
                padding: "0 14px",
                background: "#e6e6e6",
                color: "#2f3031",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                boxShadow:
                  "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "transform 160ms ease, box-shadow 160ms ease",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px)";
                e.currentTarget.style.boxShadow =
                  "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
            >
              <PenLine size={13} />
              Open Editor
            </Link>

            <Link
              href={previewHref}
              aria-label="Preview active resume"
              className="inline-flex shrink-0 items-center justify-center"
              style={{
                width: "34px",
                height: "34px",
                background: "#111214",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "8px",
                color: "#9c9c9d",
                textDecoration: "none",
                transition: "border-color 160ms ease, color 160ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
                e.currentTarget.style.color = "#f3f3f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.color = "#9c9c9d";
              }}
            >
              <Eye size={14} />
            </Link>

            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Open resume actions"
                onClick={() => setMenuOpen((value) => !value)}
                className="inline-flex items-center justify-center"
                style={{
                  width: "34px",
                  height: "34px",
                  background: menuOpen ? "rgba(255,255,255,0.04)" : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  color: menuOpen ? "#9c9c9d" : "#6a6b6c",
                  cursor: "pointer",
                  transition: "background 160ms ease, color 160ms ease",
                }}
              >
                <MoreHorizontal size={14} />
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    width: "196px",
                    padding: "6px",
                    background: "#111214",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "10px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
                    zIndex: 50,
                  }}
                >
                  {resume.slug && (
                    <MenuLink href={`/r/${resume.slug}`} icon={Eye}>
                      View public
                    </MenuLink>
                  )}

                  <MenuButton
                    icon={Copy}
                    disabled={!resume.slug}
                    onClick={handleCopyPublicLink}
                  >
                    {copyState === "copied" ? "Copied!" : "Copy link"}
                  </MenuButton>

                  <MenuButton icon={Download} onClick={handleDownloadPdf}>
                    Download PDF
                  </MenuButton>

                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.06)",
                      margin: "5px 0",
                    }}
                  />

                  <MenuButton
                    icon={Trash2}
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(resume.id);
                    }}
                  >
                    Delete
                  </MenuButton>
                </div>
              )}
            </div>
          </div>
        </div>

        <MiniResumeThumbnail />
      </div>
    </section>
  );
}

function ActiveResumeSkeleton() {
  return (
    <section
      className="w-full min-w-0"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <SkeletonBlock width="100px" height="10px" marginBottom="12px" />
          <SkeletonBlock width="180px" height="16px" marginBottom="8px" />
          <SkeletonBlock width="130px" height="13px" marginBottom="12px" />
          <SkeletonBlock width="200px" height="12px" />
        </div>

        <div
          className="animate-pulse shrink-0"
          style={{
            width: "68px",
            height: "88px",
            background: "#1b1c1e",
            borderRadius: "4px",
          }}
        />
      </div>
    </section>
  );
}

function ActiveResumeEmptyState({
  onUploadClick,
}: {
  onUploadClick?: () => void;
}) {
  return (
    <section
      className="w-full min-w-0"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <FileText size={28} color="#454647" />

        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            fontSize: "14px",
            fontWeight: 600,
            color: "#6a6b6c",
          }}
        >
          No resume yet
        </p>

        <p
          style={{
            marginTop: "4px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#454647",
          }}
        >
          Upload a PDF to begin
        </p>

        {onUploadClick ? (
          <button
            type="button"
            onClick={onUploadClick}
            style={{
              marginTop: "14px",
              height: "34px",
              padding: "0 14px",
              background: "#e6e6e6",
              color: "#2f3031",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow:
                "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Upload Resume
          </button>
        ) : (
          <Link
            href={FILES_ROUTE}
            className="inline-flex items-center justify-center"
            style={{
              marginTop: "14px",
              height: "34px",
              padding: "0 14px",
              background: "#e6e6e6",
              color: "#2f3031",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              boxShadow:
                "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            Upload Resume
          </Link>
        )}
      </div>
    </section>
  );
}

function MiniResumeThumbnail() {
  return (
    <div
      className="shrink-0"
      style={{
        width: "68px",
        height: "88px",
        padding: "8px",
        background: "#f7f7f2",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.40)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <div
        style={{
          width: thumbnailBarWidths[0],
          height: "4px",
          background: "#333333",
          borderRadius: "1px",
        }}
      />

      <div
        style={{
          width: thumbnailBarWidths[1],
          height: "2px",
          background: "#9c9c9d",
          borderRadius: "1px",
        }}
      />

      {thumbnailBarWidths.slice(2).map((width, index) => (
        <div
          key={`${width}-${index}`}
          style={{
            width,
            height: "2px",
            background: "#d0d0cc",
            borderRadius: "1px",
          }}
        />
      ))}
    </div>
  );
}

function SkeletonBlock({
  width,
  height,
  marginBottom,
}: {
  width: string;
  height: string;
  marginBottom?: string;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        marginBottom,
        background: "#1b1c1e",
        borderRadius: "4px",
      }}
    />
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        height: "34px",
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        borderRadius: "7px",
        fontSize: "13px",
        color: "#9c9c9d",
        textDecoration: "none",
        transition: "background 120ms ease, color 120ms ease",
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
      <Icon size={14} />
      {children}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        height: "34px",
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        border: "none",
        borderRadius: "7px",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.38 : 1,
        fontSize: "13px",
        color: danger ? "#ff8c8c" : "#9c9c9d",
        transition: "background 120ms ease, color 120ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;

        e.currentTarget.style.background = danger
          ? "rgba(255,99,99,0.08)"
          : "rgba(255,255,255,0.05)";
        e.currentTarget.style.color = danger ? "#ff8c8c" : "#f3f3f3";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;

        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "#ff8c8c" : "#9c9c9d";
      }}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}