"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData } from "@/lib/resume/schema";

interface SkillsEditorProps {
  data: ResumeData["skills"];
  onChange: (updated: ResumeData["skills"]) => void;
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

const LEVELS = [
  { value: null, label: "—" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

export function SkillsEditor({ data, onChange }: SkillsEditorProps) {
  const updateItem = (index: number, updates: Partial<ResumeData["skills"][number]>) => {
    const next = [...data]; next[index] = { ...next[index], ...updates }; onChange(next);
  };

  const addItem = () => {
    onChange([...data, { id: crypto.randomUUID(), name: "", category: "", level: null }]);
  };

  const removeItem = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  // Group by category for display
  const categories = Array.from(new Set(data.map((s) => s.category).filter(Boolean)));

  return (
    <div className="flex flex-col gap-4">
      {/* Skill count */}
      <div className="flex items-center justify-between">
        <span style={LABEL_STYLE}>
          Skills ({data.length})
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            color: data.length >= 3 ? "#00ac5c" : "#e7c59a",
          }}
        >
          {data.length >= 3 ? "✓" : `${3 - data.length} more needed`}
        </span>
      </div>

      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}>
          <span style={{ fontSize: 13 }}>No skills added yet</span>
        </div>
      )}

      {/* Skill entries */}
      <div className="flex flex-col gap-2">
        {data.map((skill, index) => (
          <div
            key={skill.id}
            className="flex items-center gap-2 rounded-lg px-3"
            style={{
              height: 44,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Skill name */}
            <input
              type="text"
              value={skill.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              placeholder="React, TypeScript..."
              style={{ ...INPUT_STYLE, flex: 1, border: "none", background: "transparent", height: 32 }}
              className="focus:ring-0"
              aria-label={`Skill name ${index + 1}`}
            />

            {/* Category */}
            <input
              type="text"
              value={skill.category}
              onChange={(e) => updateItem(index, { category: e.target.value })}
              placeholder="Category"
              style={{ ...INPUT_STYLE, width: 100, border: "none", background: "transparent", height: 32, fontSize: 12, color: "#9c9c9d" }}
              className="focus:ring-0 hidden md:block"
              aria-label={`Skill category ${index + 1}`}
            />

            {/* Level */}
            <select
              value={skill.level || ""}
              onChange={(e) => updateItem(index, { level: (e.target.value || null) as ResumeData["skills"][number]["level"] })}
              style={{ ...INPUT_STYLE, width: 110, border: "none", background: "transparent", height: 32, fontSize: 12, color: "#9c9c9d", cursor: "pointer" }}
              className="hidden md:block"
              aria-label={`Skill level ${index + 1}`}
            >
              {LEVELS.map((l) => (
                <option key={l.label} value={l.value || ""} style={{ background: "#111214", color: "#f3f3f3" }}>
                  {l.label}
                </option>
              ))}
            </select>

            {/* Remove */}
            <button
              onClick={() => removeItem(skill.id)}
              className="shrink-0 flex items-center justify-center rounded-md"
              style={{ width: 24, height: 24, color: "#ff8c8c" }}
              aria-label={`Remove skill ${skill.name || index + 1}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Categories hint */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <span
              key={cat}
              style={{
                fontSize: 10,
                fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                color: "#6a6b6c",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={addItem}
        className="flex items-center justify-center gap-2 rounded-lg"
        style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}
      >
        <Plus size={14} />
        Add Skill
      </button>
    </div>
  );
}
