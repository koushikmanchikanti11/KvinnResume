"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Copy,
  FileText,
  X,
} from "lucide-react";

interface ParsedJsonPreviewProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

type PreviewTab = "json" | "formatted";

function stringifyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function syntaxHighlightJson(json: string) {
  const escaped = escapeHtml(json);

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let color = "#8d6bff";

      if (/^"/.test(match)) {
        color = /:$/.test(match) ? "#56c2ff" : "#e7c59a";
      } else if (/true|false/.test(match)) {
        color = "#00ac5c";
      } else if (/null/.test(match)) {
        color = "#ff6363";
      }

      return `<span style="color:${color}">${match}</span>`;
    }
  );
}

function formatSectionLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toUpperCase();
}

function isRenderableObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function ParsedJsonPreview({
  fileId,
  fileName,
  isOpen,
  onClose,
}: ParsedJsonPreviewProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [tab, setTab] = useState<PreviewTab>("json");
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    async function fetchParsedJson() {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(`/api/files/${fileId}/parsed-json`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch parsed JSON");
        }

        const result = await response.json();

        if (!mounted) return;

        setData(result?.data ?? result?.parsed_json ?? result);
      } catch (fetchError) {
        console.error("Failed to load parsed content:", fetchError);

        if (!mounted) return;

        setData(null);
        setError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchParsedJson();

    return () => {
      mounted = false;
    };
  }, [isOpen, fileId]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const prettyJson = useMemo(() => stringifyJson(data), [data]);

  const highlightedJson = useMemo(
    () => syntaxHighlightJson(prettyJson),
    [prettyJson]
  );

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(prettyJson);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (copyError) {
      console.error("Failed to copy JSON:", copyError);
    }
  }

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Parsed JSON preview for ${fileName}`}
      onMouseDown={handleOverlayClick}
      className="items-end md:items-center"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "24px",
        animation: "parsed-json-fade 180ms ease",
      }}
    >
      <style>
        {`
          @keyframes parsed-json-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes parsed-json-scale {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes parsed-json-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.7; }
          }

          @media (prefers-reduced-motion: reduce) {
            .parsed-json-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }

          @media (max-width: 767px) {
            .parsed-json-panel {
              max-width: 100% !important;
              max-height: 92vh !important;
              border-radius: 14px 14px 0 0 !important;
              margin: 0 !important;
              align-self: flex-end !important;
            }

            .parsed-json-overlay-padding {
              padding: 0 !important;
            }
          }
        `}
      </style>

      <div
        ref={panelRef}
        className="parsed-json-panel parsed-json-animated"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "80vh",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "14px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation:
            "parsed-json-scale 240ms cubic-bezier(0.23, 1, 0.32, 1)",
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
          <div
            className="min-w-0"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#f3f3f3",
            }}
          >
            <FileText
              size={16}
              style={{
                color: "#6a6b6c",
                flexShrink: 0,
              }}
            />

            <span className="truncate">{fileName}</span>
          </div>

          <button
            type="button"
            aria-label="Close parsed JSON preview"
            onClick={onClose}
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
              flexShrink: 0,
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

        {/* Toolbar */}
        <div
          style={{
            height: "40px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <TabButton active={tab === "json"} onClick={() => setTab("json")}>
            JSON
          </TabButton>

          <TabButton
            active={tab === "formatted"}
            onClick={() => setTab("formatted")}
          >
            Formatted
          </TabButton>

          <button
            type="button"
            onClick={handleCopyJson}
            disabled={loading || error}
            className="ml-auto"
            style={{
              height: "28px",
              padding: "0 10px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              fontSize: "12px",
              color: copied ? "#00ac5c" : "#9c9c9d",
              cursor: loading || error ? "not-allowed" : "pointer",
              opacity: loading || error ? 0.4 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              transition: "border-color 160ms ease, color 160ms ease",
            }}
            onMouseEnter={(event) => {
              if (loading || error) return;
              event.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
              event.currentTarget.style.color = copied ? "#00ac5c" : "#f3f3f3";
            }}
            onMouseLeave={(event) => {
              if (loading || error) return;
              event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              event.currentTarget.style.color = copied ? "#00ac5c" : "#9c9c9d";
            }}
          >
            <Copy size={12} />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
          }}
        >
          {loading ? (
            <ParsedJsonSkeleton />
          ) : error ? (
            <ParsedJsonError />
          ) : tab === "json" ? (
            <pre
              style={{
                margin: 0,
                background: "transparent",
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                fontSize: "12px",
                lineHeight: 1.6,
                color: "#9c9c9d",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
              dangerouslySetInnerHTML={{
                __html: highlightedJson,
              }}
            />
          ) : (
            <FormattedJsonView data={data} />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: "28px",
        padding: "0 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily:
          "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        cursor: "pointer",
        background: active ? "#1b1c1e" : "transparent",
        color: active ? "#f3f3f3" : "#6a6b6c",
        border: active
          ? "1px solid rgba(255,255,255,0.10)"
          : "1px solid transparent",
        transition: "background 160ms ease, color 160ms ease",
      }}
    >
      {children}
    </button>
  );
}

function FormattedJsonView({ data }: { data: unknown }) {
  if (!isRenderableObject(data)) {
    return (
      <div
        style={{
          fontSize: "13px",
          color: "#6a6b6c",
        }}
      >
        No formatted sections available.
      </div>
    );
  }

  const entries = Object.entries(data).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  });

  if (entries.length === 0) {
    return (
      <div
        style={{
          fontSize: "13px",
          color: "#6a6b6c",
        }}
      >
        No formatted sections available.
      </div>
    );
  }

  return (
    <div>
      {entries.map(([key, value], index) => (
        <div
          key={key}
          style={{
            paddingBottom: "16px",
            marginBottom: index === entries.length - 1 ? 0 : "16px",
            borderBottom:
              index === entries.length - 1
                ? "none"
                : "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              fontSize: "10px",
              color: "#454647",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "6px",
            }}
          >
            {formatSectionLabel(key)}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#f3f3f3",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {renderFormattedValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderFormattedValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return "—";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {value.map((item, index) => (
          <div key={index}>{renderFormattedValue(item)}</div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <pre
        style={{
          margin: 0,
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          lineHeight: 1.6,
          color: "#9c9c9d",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {stringifyJson(value)}
      </pre>
    );
  }

  return String(value);
}

function ParsedJsonSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="parsed-json-animated"
          style={{
            height: "14px",
            width: item === 0 ? "88%" : item === 1 ? "64%" : "76%",
            background: "#1b1c1e",
            borderRadius: "4px",
            animation: "parsed-json-pulse 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

function ParsedJsonError() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "220px",
      }}
    >
      <AlertCircle size={24} color="#ff6363" />

      <div
        style={{
          marginTop: "8px",
          fontSize: "13px",
          color: "#6a6b6c",
        }}
      >
        Failed to load parsed content
      </div>
    </div>
  );
}

export default ParsedJsonPreview;