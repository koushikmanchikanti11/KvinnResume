"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData } from "@/lib/resume/schema";

interface SocialsEditorProps {
  data: ResumeData["socialLinks"];
  onChange: (updated: ResumeData["socialLinks"]) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", height: 36, padding: "0 12px", fontSize: 14, color: "#f3f3f3",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, outline: "none", fontFamily: "var(--font-inter), Inter, sans-serif",
};
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: 11,
  fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
  letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#6a6b6c", marginBottom: 6,
};

const COMMON_PLATFORMS = [
  "GitHub", "LinkedIn", "LeetCode", "Portfolio", "Twitter/X", "YouTube",
  "Stack Overflow", "Medium", "Dev.to", "Dribbble", "Behance", "Other",
];

export function SocialsEditor({ data, onChange }: SocialsEditorProps) {
  const updateItem = (i: number, u: Partial<ResumeData["socialLinks"][number]>) => {
    const n = [...data]; n[i] = { ...n[i], ...u }; onChange(n);
  };
  const addItem = () => {
    onChange([...data, { id: crypto.randomUUID(), platform: "", url: "", username: "" }]);
  };
  const removeItem = (id: string) => { onChange(data.filter((x) => x.id !== id)); };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}>
          <span style={{ fontSize: 13 }}>No social links yet</span>
        </div>
      )}

      {data.map((item, index) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-lg p-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 flex flex-col gap-3">
              {/* Platform selector */}
              <div>
                <label style={LABEL_STYLE} htmlFor={`social-platform-${item.id}`}>
                  Platform
                </label>
                <select
                  id={`social-platform-${item.id}`}
                  value={item.platform}
                  onChange={(e) => updateItem(index, { platform: e.target.value })}
                  style={{
                    ...INPUT_STYLE,
                    cursor: "pointer",
                    appearance: "auto" as const,
                  }}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                >
                  <option value="" style={{ background: "#111214", color: "#f3f3f3" }}>
                    Select platform
                  </option>
                  {COMMON_PLATFORMS.map((p) => (
                    <option key={p} value={p} style={{ background: "#111214", color: "#f3f3f3" }}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL */}
              <div>
                <label style={LABEL_STYLE} htmlFor={`social-url-${item.id}`}>URL</label>
                <input
                  id={`social-url-${item.id}`}
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItem(index, { url: e.target.value })}
                  placeholder="https://github.com/username"
                  style={INPUT_STYLE}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>

              {/* Username */}
              <div>
                <label style={LABEL_STYLE} htmlFor={`social-user-${item.id}`}>Username</label>
                <input
                  id={`social-user-${item.id}`}
                  type="text"
                  value={item.username}
                  onChange={(e) => updateItem(index, { username: e.target.value })}
                  placeholder="@username"
                  style={INPUT_STYLE}
                  className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
                />
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeItem(item.id)}
              className="shrink-0 mt-6 flex items-center justify-center rounded-md"
              style={{ width: 28, height: 28, color: "#ff8c8c", border: "1px solid rgba(255,99,99,0.2)", background: "transparent" }}
              aria-label={`Remove ${item.platform || "social link"}`}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ))}

      <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}>
        <Plus size={14} />
        Add Social Link
      </button>
    </div>
  );
}
