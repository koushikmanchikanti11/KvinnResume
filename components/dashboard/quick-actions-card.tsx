"use client";

import { useState } from "react";
import {
  BarChart2,
  Download,
  FilePlus,
  Globe,
  MessageSquare,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

interface QuickActionsCardProps {
  onUpload: () => void;
  onNewResume: () => void;
  onAIChat: () => void;
  onPublish: () => void;
  onDownloadPDF: () => void;
  onViewAnalytics: () => void;
}

interface ActionDef {
  icon: LucideIcon;
  label: string;
  accent: string;
  key:
    | "onUpload"
    | "onNewResume"
    | "onAIChat"
    | "onPublish"
    | "onDownloadPDF"
    | "onViewAnalytics";
  shortcut?: string;
}

const actions: ActionDef[] = [
  {
    icon: UploadCloud,
    label: "Upload",
    accent: "#e7c59a",
    key: "onUpload",
  },
  {
    icon: FilePlus,
    label: "New Resume",
    accent: "#56c2ff",
    key: "onNewResume",
    shortcut: "⌘N",
  },
  {
    icon: MessageSquare,
    label: "Ask AI",
    accent: "#8d6bff",
    key: "onAIChat",
  },
  {
    icon: Globe,
    label: "Publish",
    accent: "#00ac5c",
    key: "onPublish",
  },
  {
    icon: Download,
    label: "Download PDF",
    accent: "#f3f3f3",
    key: "onDownloadPDF",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    accent: "#e7c59a",
    key: "onViewAnalytics",
  },
];

export function QuickActionsCard(props: QuickActionsCardProps) {
  return (
    <section
      className="w-full min-w-0 max-md:p-[14px]"
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <div
        style={{
          marginBottom: "14px",
          fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          fontSize: "10px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#454647",
        }}
      >
        QUICK ACTIONS
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-2 max-sm:grid-cols-2">
        {actions.map((action) => (
          <ActionButton
            key={action.key}
            action={action}
            onClick={props[action.key]}
          />
        ))}
      </div>
    </section>
  );
}

function ActionButton({
  action,
  onClick,
}: {
  action: ActionDef;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => {
        setHovered(false);
        setPressed(false);
      }}
      className="relative flex h-[72px] min-w-0 flex-col items-center justify-center gap-2 rounded-[10px] max-md:h-[60px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
      style={{
        background: hovered ? "#202124" : "#1b1c1e",
        border: `1px solid ${
          hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"
        }`,
        cursor: "pointer",
        transition:
          "background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        boxShadow: pressed
          ? "0 1px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 2px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        transform: pressed ? "translateY(1px)" : "translateY(0)",
        padding: "0 8px",
      }}
    >
      <Icon
        size={20}
        className="max-md:!h-[18px] max-md:!w-[18px]"
        strokeWidth={2}
        style={{
          color: hovered ? action.accent : "#9c9c9d",
          transition: "color 160ms ease",
          flexShrink: 0,
        }}
      />

      <span
        className="max-w-full truncate text-center text-[12px] max-md:text-[11px]"
        style={{
          fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
          fontWeight: 500,
          color: hovered ? "#f3f3f3" : "#6a6b6c",
          transition: "color 160ms ease",
          lineHeight: 1.3,
        }}
      >
        {action.label}
      </span>

      {action.shortcut && (
        <span
          className="absolute bottom-[5px] right-[5px] hidden md:flex"
          style={{
            height: "14px",
            padding: "0 4px",
            alignItems: "center",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "3px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            fontSize: "9px",
            color: hovered ? "#6a6b6c" : "#454647",
            transition: "color 160ms ease",
          }}
        >
          {action.shortcut}
        </span>
      )}
    </button>
  );
}

export default QuickActionsCard;