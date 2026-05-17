"use client";

import { Upload, FileText, MessageSquare } from "lucide-react";

export function QuickActionsCard() {
  const actions = [
    { label: "Upload Resume", icon: Upload },
    { label: "Create Blank Resume", icon: FileText },
    { label: "Ask AI", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          style={{
            height: "36px",
            padding: "0 14px",
            borderRadius: "8px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f3f3f3",
            fontSize: "14px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "transform 160ms ease, border-color 160ms ease, background 160ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1b1c1e";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111214";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(1px)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <action.icon size={16} style={{ color: "#9c9c9d" }} />
          {action.label}
        </button>
      ))}
    </div>
  );
}
