"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData, ResumeCustomSection } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

interface CustomSectionEditorProps {
  data: ResumeData["customSections"];
  onChange: (updated: ResumeData["customSections"]) => void;
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

export function CustomSectionEditor({ data, onChange }: CustomSectionEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => { setExpandedIds((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const updateSection = (i: number, u: Partial<ResumeCustomSection>) => { const n = [...data]; n[i] = { ...n[i], ...u }; onChange(n); };
  const addSection = () => { const id = crypto.randomUUID(); onChange([...data, { id, title: "", items: [] }]); setExpandedIds((p) => new Set(p).add(id)); };
  const removeSection = (id: string) => { onChange(data.filter((x) => x.id !== id)); };

  const addItem = (sectionIdx: number) => {
    const next = [...data];
    next[sectionIdx] = { ...next[sectionIdx], items: [...next[sectionIdx].items, { id: crypto.randomUUID(), content: "" }] };
    onChange(next);
  };
  const updateItem = (sectionIdx: number, itemIdx: number, content: string) => {
    const next = [...data];
    const items = [...next[sectionIdx].items];
    items[itemIdx] = { ...items[itemIdx], content };
    next[sectionIdx] = { ...next[sectionIdx], items };
    onChange(next);
  };
  const removeItem = (sectionIdx: number, itemIdx: number) => {
    const next = [...data];
    next[sectionIdx] = { ...next[sectionIdx], items: next[sectionIdx].items.filter((_, i) => i !== itemIdx) };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (<div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}><span style={{ fontSize: 13 }}>No custom sections yet</span></div>)}
      {data.map((section, index) => (
        <ResumeEntryCard key={section.id} title={section.title || "New Section"} subtitle={`${section.items.length} items`} isExpanded={expandedIds.has(section.id)} onToggle={() => toggleExpanded(section.id)} onDelete={() => removeSection(section.id)}>
          <div className="flex flex-col gap-3">
            <div><label style={LABEL_STYLE} htmlFor={`cust-title-${section.id}`}>Section Title</label><input id={`cust-title-${section.id}`} type="text" value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} placeholder="Languages, Interests, etc." style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            
            <div>
              <span style={{ ...LABEL_STYLE, marginBottom: 8, display: "block" }}>Items</span>
              <div className="flex flex-col gap-2">
                {section.items.map((item, itemIdx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="shrink-0" style={{ color: "#454647", fontSize: 8 }}>●</span>
                    <input type="text" value={item.content} onChange={(e) => updateItem(index, itemIdx, e.target.value)} placeholder="Content..." style={{ ...INPUT_STYLE, flex: 1 }} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" aria-label={`Item ${itemIdx + 1}`} />
                    <button onClick={() => removeItem(index, itemIdx)} className="shrink-0 flex items-center justify-center rounded-md" style={{ width: 24, height: 24, color: "#ff8c8c", background: "transparent" }} aria-label="Remove"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addItem(index)} className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: "#9c9c9d", border: "1px dashed rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent" }}><Plus size={12} />Add item</button>
            </div>
          </div>
        </ResumeEntryCard>
      ))}
      <button onClick={addSection} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}><Plus size={14} />Add Custom Section</button>
    </div>
  );
}
