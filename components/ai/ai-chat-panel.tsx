"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import AiCommandChip from "./ai-command-chip";
import AiContextSelector from "./ai-context-selector";
import AiMessageBubble from "./ai-message-bubble";
import AiModelSelector, { type AiModel } from "./ai-model-selector";

export type MessageRecord = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ResumeOption = {
  id: string;
  title: string;
  updatedAt: string;
};

interface AiChatPanelProps {
  conversationId: string | null;
  messages: MessageRecord[];
  resumes: ResumeOption[];
  selectedResumeId: string | null;
  onResumeSelect: (id: string | null) => void;
  userCredits: number;
  onSendMessage: (content: string, model: AiModel) => Promise<void>;
  isStreaming: boolean;
  streamingContent: string;
  className?: string;
  isMessagesLoading?: boolean;
  onStopStreaming?: () => void;
}

const quickCommands = [
  {
    label: "Improve summary",
    prompt:
      "Improve my resume summary to make it more clear, confident, and recruiter-friendly.",
  },
  {
    label: "Add metrics",
    prompt:
      "Review my resume and suggest where I can add measurable impact, numbers, and stronger outcomes.",
  },
  {
    label: "ATS optimize",
    prompt:
      "Optimize my resume for ATS. Suggest keyword improvements, formatting issues, and missing skills.",
  },
  {
    label: "Rewrite for frontend",
    prompt:
      "Rewrite my resume content for a frontend developer role with stronger technical impact.",
  },
  {
    label: "Write cover letter",
    prompt:
      "Write a concise, professional cover letter based on my resume context.",
  },
];

export default function AiChatPanel({
  conversationId,
  messages,
  resumes,
  selectedResumeId,
  onResumeSelect,
  userCredits,
  onSendMessage,
  isStreaming,
  streamingContent,
  className,
  isMessagesLoading = false,
  onStopStreaming,
}: AiChatPanelProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<AiModel>("nano_2_5");
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = input.trim().length > 0 && userCredits > 0 && !isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, streamingContent, isStreaming]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "44px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  async function handleSend(customPrompt?: string) {
    const content = (customPrompt ?? input).trim();

    if (!content || userCredits <= 0 || isStreaming) return;

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }

    await onSendMessage(content, model);
  }

  async function handleQuickCommand(label: string, prompt: string) {
    if (userCredits <= 0 || isStreaming) return;

    setActiveCommand(label);

    try {
      await handleSend(prompt);
    } finally {
      setActiveCommand(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <section
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#040506",
        minWidth: 0,
      }}
    >
      <style>
        {`
          @keyframes ai-panel-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.7; }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-panel-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          .ai-quick-strip::-webkit-scrollbar {
            display: none;
          }

          @media (max-width: 767px) {
            .ai-chat-messages {
              padding: 16px 12px !important;
            }

            .ai-chat-input-area {
              padding: 8px 12px 92px !important;
            }

            .ai-chat-textarea {
              font-size: 16px !important;
            }

            .ai-quick-strip {
              height: 40px !important;
              padding: 0 12px !important;
              gap: 5px !important;
            }
          }
        `}
      </style>

      {/* Zone 1 — Context bar */}
      <AiContextSelector
        selectedResumeId={selectedResumeId}
        resumes={resumes}
        onSelect={onResumeSelect}
      />

      {/* Zone 2 — Quick commands */}
      <div
        className="ai-quick-strip"
        style={{
          height: "44px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          overflowY: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
      >
        {quickCommands.map((command) => (
          <AiCommandChip
            key={command.label}
            label={command.label}
            disabled={userCredits === 0 || isStreaming}
            isActive={activeCommand === command.label}
            onClick={() => handleQuickCommand(command.label, command.prompt)}
          />
        ))}
      </div>

      {/* Zone 3 — Messages */}
      <div
        className="ai-chat-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {isMessagesLoading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 && !conversationId && !isStreaming ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((message) => (
              <AiMessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.createdAt}
              />
            ))}

            {isStreaming && (
              <AiMessageBubble
                role="assistant"
                content={streamingContent}
                timestamp={new Date().toISOString()}
                isStreaming
              />
            )}
          </>
        )}

        <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
      </div>

      {/* Zero credits banner */}
      {userCredits === 0 && (
        <div
          style={{
            height: "36px",
            background: "rgba(255,99,99,0.06)",
            borderTop: "1px solid rgba(255,99,99,0.15)",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "12px",
            color: "#ff6363",
            flexShrink: 0,
          }}
        >
          <span>You're out of credits — AI is paused.</span>

          <Link
            href="/billing"
            style={{
              fontSize: "12px",
              color: "#ff6363",
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
          >
            Buy Credits
          </Link>
        </div>
      )}

      {/* Zone 4 — Input */}
      <div
        className="ai-chat-input-area"
        style={{
          padding: "12px 16px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transition: "border-color 160ms ease",
          }}
          onFocusCapture={(event) => {
            event.currentTarget.style.borderColor = "rgba(231,197,154,0.3)";
          }}
          onBlurCapture={(event) => {
            event.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            disabled={isStreaming || userCredits === 0}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about your resume…"
            className="ai-chat-textarea"
            rows={1}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              width: "100%",
              fontSize: "14px",
              fontFamily: "Inter, system-ui, sans-serif",
              color: "#f3f3f3",
              lineHeight: 1.5,
              minHeight: "44px",
              maxHeight: "120px",
              overflowY: "auto",
              padding: 0,
              opacity: userCredits === 0 ? 0.45 : 1,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <AiModelSelector
              value={model}
              onChange={setModel}
              disabled={isStreaming}
            />

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {userCredits < 100 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily:
                      "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                    fontSize: "11px",
                    color: userCredits < 20 ? "#ff6363" : "#e7c59a",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>◆</span>
                  <span>{userCredits} credits</span>
                </div>
              )}

              <button
                type="button"
                disabled={!canSend && !isStreaming}
                onClick={() => {
                  if (isStreaming) {
                    onStopStreaming?.();
                    return;
                  }

                  handleSend();
                }}
                style={{
                  height: "32px",
                  padding: "0 14px",
                  background: "#e6e6e6",
                  color: "#2f3031",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  cursor:
                    !canSend && !isStreaming ? "not-allowed" : "pointer",
                  opacity: !canSend && !isStreaming ? 0.4 : 1,
                  boxShadow:
                    "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  whiteSpace: "nowrap",
                }}
                onMouseDown={(event) => {
                  if (!canSend && !isStreaming) return;
                  event.currentTarget.style.transform = "translateY(1px)";
                  event.currentTarget.style.boxShadow =
                    "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                }}
                onMouseUp={(event) => {
                  if (!canSend && !isStreaming) return;
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.boxShadow =
                    "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                }}
              >
                {isStreaming ? "■ Stop" : "↵ SEND"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        height: "100%",
        minHeight: "260px",
      }}
    >
      <Sparkles size={36} color="#454647" style={{ opacity: 0.6 }} />

      <div
        style={{
          marginTop: "14px",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#454647",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        START A CONVERSATION
      </div>

      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          fontSize: "13px",
          color: "#6a6b6c",
          textAlign: "center",
          maxWidth: "260px",
          lineHeight: 1.55,
        }}
      >
        Ask AI to improve your resume, rewrite bullets, or optimize for ATS.
      </p>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        className="ai-panel-animated"
        style={{
          alignSelf: "flex-start",
          width: "70%",
          height: "56px",
          background: "#111214",
          borderRadius: "10px 10px 10px 2px",
          marginBottom: "16px",
          animation: "ai-panel-pulse 1.4s ease-in-out infinite",
        }}
      />

      <div
        className="ai-panel-animated"
        style={{
          alignSelf: "flex-end",
          width: "50%",
          height: "40px",
          background: "#1b1c1e",
          borderRadius: "10px 10px 2px 10px",
          marginBottom: "16px",
          animation: "ai-panel-pulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}