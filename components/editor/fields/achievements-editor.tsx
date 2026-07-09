"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { ResumeData, ResumeAchievementItem } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

interface AchievementsEditorProps {
  data: ResumeData["achievements"];
  onChange: (updated: ResumeData["achievements"]) => void;
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

export function AchievementsEditor({ data, onChange }: AchievementsEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => { setExpandedIds((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const updateItem = (i: number, u: Partial<ResumeAchievementItem>) => { const n = [...data]; n[i] = { ...n[i], ...u }; onChange(n); };
  const addItem = () => { const id = crypto.randomUUID(); onChange([...data, { id, title: "", description: "", date: "" }]); setExpandedIds((p) => new Set(p).add(id)); };
  const removeItem = (id: string) => { onChange(data.filter((x) => x.id !== id)); };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (<div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}><span style={{ fontSize: 13 }}>No achievements yet</span></div>)}
      {data.map((item, index) => (
        <ResumeEntryCard key={item.id} title={item.title || "New Achievement"} subtitle={item.date || undefined} isExpanded={expandedIds.has(item.id)} onToggle={() => toggleExpanded(item.id)} onDelete={() => removeItem(item.id)}>
          <div className="flex flex-col gap-3">
            <div><label style={LABEL_STYLE} htmlFor={`ach-title-${item.id}`}>Title</label><input id={`ach-title-${item.id}`} type="text" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} placeholder="Best Paper Award" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            <div><label style={LABEL_STYLE} htmlFor={`ach-desc-${item.id}`}>Description</label><textarea id={`ach-desc-${item.id}`} value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} placeholder="Describe your achievement..." style={{ width: "100%", minHeight: 60, padding: "10px 12px", fontSize: 14, color: "#f3f3f3", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, outline: "none", fontFamily: "var(--font-inter), Inter, sans-serif", resize: "vertical" as const }} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            <div><label style={LABEL_STYLE} htmlFor={`ach-date-${item.id}`}>Date</label><input id={`ach-date-${item.id}`} type="text" value={item.date} onChange={(e) => updateItem(index, { date: e.target.value })} placeholder="2024" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
          </div>
        </ResumeEntryCard>
      ))}
      <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}><Plus size={14} />Add Achievement</button>
    </div>
  );
}
