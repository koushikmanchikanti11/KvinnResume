"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import AiChatPanel, {
  type MessageRecord,
  type ResumeOption,
} from "./ai-chat-panel";
import type { AiModel } from "./ai-model-selector";

export type ConversationRecord = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  resumeId: string | null;
  messageCount: number;
};

export type { MessageRecord, ResumeOption };

interface AiChatClientProps {
  initialConversations: ConversationRecord[];
  initialResumes: ResumeOption[];
  userCredits: number;
  userId: string;
}

type SendMessageResponse = {
  conversationId: string;
  userMessageId: string;
  conversation?: ConversationRecord | null;
};

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

function buildConversationTitle(content: string) {
  const trimmed = content.trim();

  if (!trimmed) return "New conversation";

  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}

function buildLastMessage(content: string) {
  const trimmed = content.trim().replace(/\s+/g, " ");

  if (!trimmed) return "";

  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
}

function createOptimisticId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function AiChatClient({
  initialConversations,
  initialResumes,
  userCredits,
  userId,
}: AiChatClientProps) {
  const [conversations, setConversations] =
    useState<ConversationRecord[]>(initialConversations);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );

  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    initialConversations[0]?.resumeId ?? null
  );

  const [search, setSearch] = useState("");

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const [credits, setCredits] = useState(userCredits);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      return (
        conversation.title.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let mounted = true;

    async function loadMessages() {
      setMessagesLoading(true);

      try {
        const response = await fetch(
          `/api/ai/conversations/${activeConversationId}/messages`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = (await response.json()) as
          | MessageRecord[]
          | { messages?: MessageRecord[] };

        const nextMessages = Array.isArray(data) ? data : data.messages ?? [];

        if (!mounted) return;

        setMessages(nextMessages);
      } catch (error) {
        console.error("Failed to load AI messages:", error);

        if (mounted) {
          toast.error("Failed to load conversation messages");
          setMessages([]);
        }
      } finally {
        if (mounted) {
          setMessagesLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [activeConversationId]);

  function createNewConversation() {
    if (isStreaming) return;

    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
    setSelectedResumeId(null);
  }

  async function deleteConversation(conversationId: string) {
    if (isStreaming) return;

    const previousConversations = conversations;

    setConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId)
    );

    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
      setSelectedResumeId(null);
    }

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setConversations(previousConversations);
      toast.error("Failed to delete conversation");
    }
  }

  async function handleSendMessage(content: string, model: AiModel) {
    const trimmed = content.trim();

    if (!trimmed || credits <= 0 || isStreaming) return;

    const optimisticUserMessage: MessageRecord = {
      id: createOptimisticId("user"),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUserMessage]);
    setIsStreaming(true);
    setStreamingContent("");
    setCredits((current) => Math.max(0, current - 1));

    let conversationIdForStream = activeConversationId;

    try {
      const response = await fetch(
        `/api/ai/conversations/${activeConversationId ?? "new"}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: trimmed,
            model,
            resumeId: selectedResumeId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as SendMessageResponse;

      conversationIdForStream = data.conversationId;

      if (!conversationIdForStream || !data.userMessageId) {
        throw new Error("Invalid AI message response");
      }

      if (!activeConversationId) {
        setActiveConversationId(conversationIdForStream);

        const now = new Date().toISOString();

        const newConversation: ConversationRecord =
          data.conversation ?? {
            id: conversationIdForStream,
            title: buildConversationTitle(trimmed),
            lastMessage: buildLastMessage(trimmed),
            updatedAt: now,
            resumeId: selectedResumeId,
            messageCount: 1,
          };

        setConversations((current) => [newConversation, ...current]);
      } else {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  lastMessage: buildLastMessage(trimmed),
                  updatedAt: new Date().toISOString(),
                  messageCount: conversation.messageCount + 1,
                }
              : conversation
          )
        );
      }

      await streamAssistantResponse({
        conversationId: conversationIdForStream,
        userMessageId: data.userMessageId,
      });
    } catch (error) {
      console.error("AI send message failed:", error);

      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id)
      );

      setCredits((current) => current + 1);
      setIsStreaming(false);
      setStreamingContent("");

      toast.error("Failed to send message");
    }
  }

  async function streamAssistantResponse({
    conversationId,
    userMessageId,
  }: {
    conversationId: string;
    userMessageId: string;
  }) {
    try {
      const response = await fetch(
        `/api/ai/conversations/${conversationId}/stream?messageId=${userMessageId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to stream AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let finalContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        finalContent += chunk;
        setStreamingContent((current) => current + chunk);
      }

      const assistantMessage: MessageRecord = {
        id: createOptimisticId("assistant"),
        role: "assistant",
        content: finalContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: buildLastMessage(finalContent),
                updatedAt: new Date().toISOString(),
                messageCount: conversation.messageCount + 1,
              }
            : conversation
        )
      );
    } catch (error) {
      console.error("AI streaming failed:", error);
      toast.error("AI response failed");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        background: "#040506",
      }}
    >
      {/* Left conversation sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: "280px",
          flexShrink: 0,
          background: "#07080a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "52px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#454647",
            }}
          >
            AI CHAT
          </div>

          <button
            type="button"
            onClick={createNewConversation}
            disabled={isStreaming}
            className="inline-flex items-center gap-[5px]"
            style={{
              height: "28px",
              padding: "0 10px",
              background: "rgba(141,107,255,0.1)",
              border: "1px solid rgba(141,107,255,0.2)",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#8d6bff",
              cursor: isStreaming ? "not-allowed" : "pointer",
              opacity: isStreaming ? 0.4 : 1,
              transition: "background 160ms ease, transform 120ms ease",
            }}
            onMouseEnter={(event) => {
              if (isStreaming) return;
              event.currentTarget.style.background = "rgba(141,107,255,0.18)";
            }}
            onMouseLeave={(event) => {
              if (isStreaming) return;
              event.currentTarget.style.background = "rgba(141,107,255,0.1)";
            }}
            onMouseDown={(event) => {
              if (isStreaming) return;
              event.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(event) => {
              if (isStreaming) return;
              event.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={12} />
            New
          </button>
        </div>

        <div
          style={{
            margin: "10px 12px 6px",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6a6b6c",
              pointerEvents: "none",
            }}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations…"
            style={{
              width: "100%",
              height: "32px",
              padding: "0 10px 0 32px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "7px",
              fontSize: "12px",
              color: "#f3f3f3",
              outline: "none",
              transition: "border-color 160ms ease",
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor =
                "rgba(231,197,154,0.4)";
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor =
                "rgba(255,255,255,0.07)";
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {filteredConversations.length === 0 ? (
            <ConversationEmptyState />
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={activeConversationId === conversation.id}
                onSelect={() => {
                  if (isStreaming) return;
                  setActiveConversationId(conversation.id);
                  setSelectedResumeId(conversation.resumeId);
                }}
                onDelete={() => deleteConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right chat panel */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <AiChatPanel
          conversationId={activeConversationId}
          messages={messagesLoading ? [] : messages}
          resumes={initialResumes}
          selectedResumeId={selectedResumeId}
          onResumeSelect={setSelectedResumeId}
          userCredits={credits}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
      </main>
    </div>
  );
}

function ConversationItem({
  conversation,
  active,
  onSelect,
  onDelete,
}: {
  conversation: ConversationRecord;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: "64px",
        padding: "10px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        transition: "background 160ms ease",
        position: "relative",
        background: active ? "#111214" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        boxShadow: active ? "inset 2px 0 0 #8d6bff" : "none",
      }}
    >
      <button
        type="button"
        aria-label="Delete conversation"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        style={{
          width: "20px",
          height: "20px",
          position: "absolute",
          top: "8px",
          right: "8px",
          border: "none",
          background: "transparent",
          color: hovered ? "#454647" : "transparent",
          opacity: hovered ? 1 : 0,
          cursor: "pointer",
          transition: "opacity 160ms ease, color 160ms ease",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = "#ff6363";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = "#454647";
        }}
      >
        <X size={13} />
      </button>

      <div
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: active ? "#f3f3f3" : "#9c9c9d",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "calc(100% - 40px)",
        }}
      >
        {conversation.title || "New conversation"}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#6a6b6c",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        }}
      >
        {conversation.lastMessage || "No messages yet"}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "10px",
          color: "#454647",
        }}
      >
        <span>{formatRelativeTime(conversation.updatedAt)}</span>
        <span>
          {conversation.messageCount}{" "}
          {conversation.messageCount === 1 ? "message" : "messages"}
        </span>
      </div>
    </div>
  );
}

function ConversationEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        flex: 1,
        minHeight: "220px",
        color: "#6a6b6c",
      }}
    >
      <MessageSquare size={28} color="#454647" />

      <div
        style={{
          marginTop: "10px",
          fontSize: "13px",
          color: "#6a6b6c",
        }}
      >
        No conversations yet
      </div>
    </div>
  );
}