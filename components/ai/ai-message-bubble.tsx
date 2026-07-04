"use client";

import { useMemo, useState } from "react";
import { Copy, FileText } from "lucide-react";

export type MessageRole = "user" | "assistant";

interface AiMessageBubbleProps {
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  onInsertToResume?: () => void;
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderInlineMarkdown(value: string) {
  let html = escapeHtml(value);

  html = html.replace(
    /`([^`]+)`/g,
    `<code style="
      font-family: var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace;
      font-size: 12px;
      background: #1b1c1e;
      padding: 1px 5px;
      border-radius: 4px;
      color: #e7c59a;
    ">$1</code>`
  );

  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    `<strong style="font-weight:600;color:#ffffff;">$1</strong>`
  );

  return html;
}

function renderMarkdownLike(content: string) {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const blocks: Array<{
    type: "paragraph" | "list" | "code";
    content: string | string[];
  }> = [];

  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({
        type: "paragraph",
        content: paragraph.join(" "),
      });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({
        type: "list",
        content: [...list],
      });
      list = [];
    }
  }

  function flushCode() {
    if (code.length > 0) {
      blocks.push({
        type: "code",
        content: code.join("\n"),
      });
      code = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }

      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      list.push(trimmed.slice(2));
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushCode();

  return blocks;
}

export default function AiMessageBubble({
  role,
  content,
  timestamp,
  isStreaming = false,
  onCopy,
  onInsertToResume,
}: AiMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isAssistant = role === "assistant";
  const isSkeleton = isAssistant && isStreaming && content.trim().length === 0;

  const blocks = useMemo(() => renderMarkdownLike(content), [content]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.();

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy AI message:", error);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        marginBottom: "16px",
        justifyContent: isAssistant ? "flex-start" : "flex-end",
      }}
    >
      <style>
        {`
          @keyframes ai-message-cursor-blink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
          }

          @keyframes ai-message-skeleton-pulse {
            0%, 100% {
              opacity: 0.35;
            }
            50% {
              opacity: 0.7;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-message-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isAssistant ? "flex-start" : "flex-end",
          gap: "4px",
          maxWidth: isAssistant ? "85%" : "75%",
          minWidth: 0,
        }}
      >
        {isAssistant && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                background: "#8d6bff",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontFamily:
                  "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
                fontSize: "11px",
                color: "#6a6b6c",
                fontWeight: 500,
              }}
            >
              AI
            </span>
          </div>
        )}

        <div
          style={{
            padding: "12px 14px",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.55,
            wordBreak: "break-word",
            background: isAssistant ? "#111214" : "#1b1c1e",
            border: isAssistant
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(255,255,255,0.06)",
            borderRadius: isAssistant
              ? "10px 10px 10px 2px"
              : "10px 10px 2px 10px",
            color: "#f3f3f3",
            minWidth: isSkeleton ? "240px" : undefined,
          }}
        >
          {isSkeleton ? (
            <MessageSkeleton />
          ) : (
            <>
              <div>
                {blocks.length === 0 ? (
                  <span />
                ) : (
                  blocks.map((block, index) => {
                    if (block.type === "code") {
                      return (
                        <pre
                          key={index}
                          style={{
                            margin: index === blocks.length - 1 ? 0 : "0 0 8px",
                            background: "#1b1c1e",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "8px",
                            padding: "12px",
                            fontFamily:
                              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
                            fontSize: "12px",
                            color: "#9c9c9d",
                            overflowX: "auto",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {block.content as string}
                        </pre>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul
                          key={index}
                          style={{
                            margin:
                              index === blocks.length - 1 ? "0" : "0 0 8px",
                            paddingLeft: "14px",
                            color: "#9c9c9d",
                          }}
                        >
                          {(block.content as string[]).map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              style={{
                                marginBottom:
                                  itemIndex ===
                                  (block.content as string[]).length - 1
                                    ? 0
                                    : "4px",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: renderInlineMarkdown(item),
                              }}
                            />
                          ))}
                        </ul>
                      );
                    }

                    return (
                      <p
                        key={index}
                        style={{
                          margin:
                            index === blocks.length - 1 ? "0" : "0 0 8px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: renderInlineMarkdown(block.content as string),
                        }}
                      />
                    );
                  })
                )}

                {isAssistant && isStreaming && (
                  <span
                    className="ai-message-animated"
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "14px",
                      background: "#8d6bff",
                      borderRadius: "1px",
                      verticalAlign: "middle",
                      marginLeft: "2px",
                      animation:
                        "ai-message-cursor-blink 900ms ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>

        <span
          style={{
            display: "block",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: "10px",
            color: "#454647",
            marginTop: "4px",
            textAlign: isAssistant ? "left" : "right",
          }}
        >
          {formatTime(timestamp)}
        </span>

        {isAssistant && (onCopy || onInsertToResume) && (
          <div
            className="ai-message-animated"
            style={{
              display: "flex",
              gap: "4px",
              marginTop: "6px",
              opacity: hovered ? 1 : 0,
              transition: "opacity 160ms ease",
            }}
          >
            {onCopy && (
              <BubbleActionButton
                icon={<Copy size={11} />}
                label={copied ? "Copied!" : "Copy"}
                active={copied}
                onClick={handleCopy}
              />
            )}

            {onInsertToResume && (
              <BubbleActionButton
                icon={<FileText size={11} />}
                label="Insert"
                onClick={onInsertToResume}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div>
      <div
        className="ai-message-animated"
        style={{
          width: "85%",
          height: "12px",
          background: "#1b1c1e",
          borderRadius: "3px",
          animation: "ai-message-skeleton-pulse 1.4s ease-in-out infinite",
        }}
      />

      <div
        className="ai-message-animated"
        style={{
          width: "60%",
          height: "12px",
          marginTop: "8px",
          background: "#1b1c1e",
          borderRadius: "3px",
          animation: "ai-message-skeleton-pulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function BubbleActionButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: "24px",
        padding: "0 8px",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "5px",
        fontSize: "11px",
        color: active ? "#00ac5c" : "#6a6b6c",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        transition: "border-color 160ms ease, color 160ms ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        event.currentTarget.style.color = active ? "#00ac5c" : "#9c9c9d";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        event.currentTarget.style.color = active ? "#00ac5c" : "#6a6b6c";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export { AiMessageBubble };