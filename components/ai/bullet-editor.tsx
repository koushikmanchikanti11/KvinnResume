"use client";

import { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Plus, X } from "lucide-react";

import AiSuggestionDiff from "./ai-suggestion-diff";

export type BulletAiAction = "rewrite" | "addMetrics" | "shorten" | "ats";

export interface BulletEditorItem {
  id: string;
  text: string;
  aiSuggestion?: {
    before: string;
    after: string;
  } | null;
  isGenerating?: boolean;
}

interface BulletEditorProps {
  bullets: BulletEditorItem[];
  onBulletChange: (id: string, text: string) => void;
  onBulletDelete: (id: string) => void;
  onBulletAdd: () => void;
  onBulletReorder: (sourceIndex: number, destinationIndex: number) => void;
  onAiAction: (bulletId: string, action: BulletAiAction) => void;
  onAcceptSuggestion: (bulletId: string) => void;
  onRejectSuggestion: (bulletId: string) => void;
  onTryAgainSuggestion: (bulletId: string) => void;
  onEditSuggestion: (bulletId: string, editedText: string) => void;
  disabled?: boolean;
}

const aiActions: Array<{
  label: string;
  value: BulletAiAction;
}> = [
  { label: "Rewrite", value: "rewrite" },
  { label: "Add metrics", value: "addMetrics" },
  { label: "Shorten", value: "shorten" },
  { label: "ATS", value: "ats" },
];

export default function BulletEditor({
  bullets,
  onBulletChange,
  onBulletDelete,
  onBulletAdd,
  onBulletReorder,
  onAiAction,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTryAgainSuggestion,
  onEditSuggestion,
  disabled = false,
}: BulletEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const bulletIds = useMemo(() => bullets.map((bullet) => bullet.id), [bullets]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const sourceId = String(event.active.id);
    const destinationId = event.over ? String(event.over.id) : null;

    setActiveId(null);
    setOverId(null);

    if (!destinationId || sourceId === destinationId) return;

    const sourceIndex = bullets.findIndex((bullet) => bullet.id === sourceId);
    const destinationIndex = bullets.findIndex(
      (bullet) => bullet.id === destinationId
    );

    if (sourceIndex === -1 || destinationIndex === -1) return;

    onBulletReorder(sourceIndex, destinationIndex);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        width: "100%",
      }}
    >
      <style>
        {`
          @keyframes bullet-ai-spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .bullet-editor-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setOverId(null);
        }}
      >
        <SortableContext items={bulletIds} strategy={verticalListSortingStrategy}>
          {bullets.map((bullet) => {
            const showDropIndicator =
              activeId !== null && overId === bullet.id && activeId !== bullet.id;

            return (
              <div key={bullet.id}>
                {showDropIndicator && (
                  <div
                    style={{
                      height: "2px",
                      background: "#e7c59a",
                      borderRadius: "1px",
                      margin: "2px 0",
                    }}
                  />
                )}

                <SortableBulletItem
                  bullet={bullet}
                  disabled={disabled}
                  isDraggingActive={activeId === bullet.id}
                  onBulletChange={onBulletChange}
                  onBulletDelete={onBulletDelete}
                  onAiAction={onAiAction}
                  onAcceptSuggestion={onAcceptSuggestion}
                  onRejectSuggestion={onRejectSuggestion}
                  onTryAgainSuggestion={onTryAgainSuggestion}
                  onEditSuggestion={onEditSuggestion}
                />
              </div>
            );
          })}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={onBulletAdd}
        className="bullet-editor-animated focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
        style={{
          marginTop: "4px",
          width: "100%",
          height: "32px",
          background: "transparent",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: "6px",
          fontSize: "12px",
          fontFamily:
            "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
          color: "#454647",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "border-color 160ms ease, color 160ms ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          event.currentTarget.style.color = "#9c9c9d";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          event.currentTarget.style.color = "#454647";
        }}
      >
        <Plus size={12} />
        + ADD BULLET
      </button>
    </div>
  );
}

function SortableBulletItem({
  bullet,
  disabled,
  isDraggingActive,
  onBulletChange,
  onBulletDelete,
  onAiAction,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTryAgainSuggestion,
  onEditSuggestion,
}: {
  bullet: BulletEditorItem;
  disabled: boolean;
  isDraggingActive: boolean;
  onBulletChange: (id: string, text: string) => void;
  onBulletDelete: (id: string) => void;
  onAiAction: (bulletId: string, action: BulletAiAction) => void;
  onAcceptSuggestion: (bulletId: string) => void;
  onRejectSuggestion: (bulletId: string) => void;
  onTryAgainSuggestion: (bulletId: string) => void;
  onEditSuggestion: (bulletId: string, editedText: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: bullet.id,
    disabled,
  });

  const hasSuggestion = Boolean(bullet.aiSuggestion);
  const showAiChips = hovered && !hasSuggestion;
  const aiDisabled = disabled || Boolean(bullet.isGenerating);

  return (
    <div
      ref={setNodeRef}
      className="bullet-editor-animated"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        border:
          isDragging || isDraggingActive
            ? "1px solid #e7c59a"
            : "1px solid transparent",
        borderRadius: "8px",
        opacity: isDragging ? 0.85 : 1,
        background:
          isDragging || isDraggingActive
            ? "rgba(231,197,154,0.04)"
            : "transparent",
        cursor: isDragging ? "grabbing" : "default",
        padding: isDragging || isDraggingActive ? "4px" : "4px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          type="button"
          aria-label="Drag bullet"
          {...attributes}
          {...listeners}
          style={{
            width: "16px",
            height: "24px",
            padding: 0,
            border: "none",
            background: "transparent",
            color: "#454647",
            opacity: hovered || isDragging ? 1 : 0,
            cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
            transition: "opacity 160ms ease, color 160ms ease",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = disabled ? "#454647" : "#6a6b6c";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = "#454647";
          }}
        >
          <GripVertical size={14} />
        </button>

        <span
          style={{
            fontSize: "16px",
            color: "#6a6b6c",
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          •
        </span>

        <input
          value={bullet.text}
          onChange={(event) => onBulletChange(bullet.id, event.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Add bullet point…"
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            borderBottom: inputFocused
              ? "1px solid rgba(231,197,154,0.4)"
              : "1px solid transparent",
            outline: "none",
            fontSize: "14px",
            color: "#f3f3f3",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.5,
            padding: inputFocused ? "4px 0 3px" : "4px 0",
          }}
        />

        <button
          type="button"
          aria-label="Delete bullet"
          onClick={() => onBulletDelete(bullet.id)}
          style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#454647",
            opacity: hovered ? 1 : 0,
            transition: "opacity 160ms ease, color 160ms ease",
            flexShrink: 0,
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
      </div>

      <div
        className="bullet-editor-animated"
        style={{
          display: "flex",
          gap: "5px",
          paddingLeft: "24px",
          opacity: showAiChips ? 1 : 0,
          maxHeight: showAiChips ? "36px" : 0,
          overflow: "hidden",
          transition: "opacity 200ms ease, max-height 200ms ease",
          pointerEvents: showAiChips ? "auto" : "none",
        }}
      >
        {aiActions.map((action, index) => (
          <AiActionChip
            key={action.value}
            label={action.label}
            disabled={aiDisabled}
            loading={Boolean(bullet.isGenerating) && index === 0}
            onClick={() => onAiAction(bullet.id, action.value)}
          />
        ))}
      </div>

      {bullet.aiSuggestion && (
        <div style={{ paddingLeft: "24px" }}>
          <AiSuggestionDiff
            before={bullet.aiSuggestion.before}
            after={bullet.aiSuggestion.after}
            isLoading={bullet.isGenerating}
            onAccept={() => onAcceptSuggestion(bullet.id)}
            onTryAgain={() => onTryAgainSuggestion(bullet.id)}
            onEdit={(editedText) => onEditSuggestion(bullet.id, editedText)}
          />

          <button
            type="button"
            onClick={() => onRejectSuggestion(bullet.id)}
            style={{
              marginTop: "6px",
              height: "24px",
              padding: "0 8px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              color: "#6a6b6c",
              fontSize: "12px",
              cursor: "pointer",
              transition: "background 160ms ease, color 160ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(255,255,255,0.04)";
              event.currentTarget.style.color = "#f3f3f3";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
              event.currentTarget.style.color = "#6a6b6c";
            }}
          >
            Reject suggestion
          </button>
        </div>
      )}
    </div>
  );
}

function AiActionChip({
  label,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="bullet-editor-animated focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(141,107,255,0.6)]"
      style={{
        height: "24px",
        padding: "0 8px",
        background: "rgba(141,107,255,0.10)",
        border: "1px solid rgba(141,107,255,0.20)",
        borderRadius: "6px",
        color: "#8d6bff",
        fontSize: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        transition: "background 160ms ease, transform 120ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(event) => {
        if (disabled) return;
        event.currentTarget.style.background = "rgba(141,107,255,0.18)";
      }}
      onMouseLeave={(event) => {
        if (disabled) return;
        event.currentTarget.style.background = "rgba(141,107,255,0.10)";
      }}
      onMouseDown={(event) => {
        if (disabled) return;
        event.currentTarget.style.transform = "translateY(1px)";
      }}
      onMouseUp={(event) => {
        if (disabled) return;
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {loading && (
        <Loader2
          size={11}
          className="bullet-editor-animated"
          style={{
            color: "#8d6bff",
            animation: "bullet-ai-spin 1s linear infinite",
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </button>
  );
}

export { BulletEditor };