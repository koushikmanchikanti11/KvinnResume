"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileText, X } from "lucide-react";

interface ResumeOption {
  id: string;
  title: string;
  updatedAt: string;
}

interface AiContextSelectorProps {
  selectedResumeId: string | null;
  resumes: ResumeOption[];
  onSelect: (resumeId: string | null) => void;
  isLoading?: boolean;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "recently";

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;

  return `${months}mo ago`;
}

export default function AiContextSelector({
  selectedResumeId,
  resumes,
  onSelect,
  isLoading = false,
}: AiContextSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => resume.id === selectedResumeId) ?? null;
  }, [resumes, selectedResumeId]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSelect(resumeId: string | null) {
    onSelect(resumeId);
    setOpen(false);
  }

  return (
    <div
      style={{
        height: "48px",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#07080a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <style>
        {`
          @keyframes ai-context-fade-in {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes ai-context-pulse {
            0%, 100% {
              opacity: 0.35;
            }
            50% {
              opacity: 0.7;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-context-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <span
        style={{
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#454647",
          flexShrink: 0,
        }}
      >
        CONTEXT:
      </span>

      <div
        ref={rootRef}
        style={{
          position: "relative",
          minWidth: 0,
        }}
      >
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (isLoading) return;
            setOpen((value) => !value);
          }}
          className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "28px",
            padding: "0 10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            maxWidth: "280px",
            transition: "border-color 160ms ease, background 160ms ease",
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(event) => {
            if (isLoading) return;
            event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            event.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(event) => {
            if (isLoading) return;
            event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            event.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          <FileText
            size={13}
            style={{
              color: "#6a6b6c",
              flexShrink: 0,
            }}
          />

          {isLoading ? (
            <span
              className="ai-context-animated"
              style={{
                width: "120px",
                height: "12px",
                background: "#1b1c1e",
                borderRadius: "4px",
                animation: "ai-context-pulse 1.4s ease-in-out infinite",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: selectedResumeId ? "#f3f3f3" : "#454647",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "200px",
              }}
            >
              {selectedResume?.title || "No context selected"}
            </span>
          )}

          <ChevronDown
            size={11}
            style={{
              color: "#6a6b6c",
              flexShrink: 0,
              transition: "transform 160ms ease",
              transform: open ? "rotate(-180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {open && !isLoading && (
          <div
            className="ai-context-animated"
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 4px)",
              width: "320px",
              maxWidth: "calc(100vw - 32px)",
              background: "#111214",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "10px",
              padding: "6px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
              zIndex: 50,
              animation: "ai-context-fade-in 160ms ease",
            }}
          >
            <div
              style={{
                padding: "6px 10px 8px",
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
                fontSize: "10px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#454647",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "4px",
              }}
            >
              RESUME CONTEXT
            </div>

            {selectedResumeId !== null && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  transition: "background 120ms ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                }}
              >
                <X
                  size={13}
                  style={{
                    color: "#6a6b6c",
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontSize: "13px",
                    fontStyle: "italic",
                    color: "#6a6b6c",
                  }}
                >
                  No context
                </span>
              </button>
            )}

            {resumes.length === 0 ? (
              <div
                style={{
                  padding: "18px 10px",
                  fontSize: "13px",
                  color: "#6a6b6c",
                  textAlign: "center",
                }}
              >
                No resumes available
              </div>
            ) : (
              resumes.map((resume) => {
                const selected = resume.id === selectedResumeId;

                return (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => handleSelect(resume.id)}
                    style={{
                      width: "100%",
                      minWidth: 0,
                      height: "44px",
                      padding: selected ? "0 10px 0 8px" : "0 10px",
                      borderRadius: "8px",
                      border: "none",
                      borderLeft: selected
                        ? "2px solid #8d6bff"
                        : "2px solid transparent",
                      background: selected
                        ? "rgba(141,107,255,0.06)"
                        : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      transition: "background 120ms ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = selected
                        ? "rgba(141,107,255,0.06)"
                        : "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = selected
                        ? "rgba(141,107,255,0.06)"
                        : "transparent";
                    }}
                  >
                    <FileText
                      size={14}
                      style={{
                        color: selected ? "#8d6bff" : "#6a6b6c",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#f3f3f3",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {resume.title || "Untitled Resume"}
                      </span>

                      <span
                        style={{
                          fontFamily:
                            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
                          fontSize: "11px",
                          color: "#6a6b6c",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Updated {formatRelativeTime(resume.updatedAt)}
                      </span>
                    </span>

                    {selected && (
                      <Check
                        size={13}
                        style={{
                          color: "#8d6bff",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedResumeId && (
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "999px",
              background: "#8d6bff",
            }}
          />

          <span
            style={{
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
              fontSize: "10px",
              color: "#454647",
              whiteSpace: "nowrap",
            }}
          >
            AI READY
          </span>
        </div>
      )}
    </div>
  );
}

export type { ResumeOption };
export { AiContextSelector };