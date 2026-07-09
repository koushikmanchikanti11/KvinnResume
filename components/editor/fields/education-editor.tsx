"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData, ResumeEducationItem } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

interface EducationEditorProps {
  data: ResumeData["education"];
  onChange: (updated: ResumeData["education"]) => void;
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

export function EducationEditor({ data, onChange }: EducationEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const updateItem = (index: number, updates: Partial<ResumeEducationItem>) => {
    const next = [...data]; next[index] = { ...next[index], ...updates }; onChange(next);
  };
  const addItem = () => {
    const newId = crypto.randomUUID();
    onChange([...data, { id: newId, institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", gpa: "", highlights: [] }]);
    setExpandedIds((prev) => new Set(prev).add(newId));
  };
  const removeItem = (id: string) => { onChange(data.filter((item) => item.id !== id)); };

  const addHighlight = (index: number) => { const next = [...data]; next[index] = { ...next[index], highlights: [...next[index].highlights, ""] }; onChange(next); };
  const updateHighlight = (itemIdx: number, hIdx: number, value: string) => { const next = [...data]; const h = [...next[itemIdx].highlights]; h[hIdx] = value; next[itemIdx] = { ...next[itemIdx], highlights: h }; onChange(next); };
  const removeHighlight = (itemIdx: number, hIdx: number) => { const next = [...data]; next[itemIdx] = { ...next[itemIdx], highlights: next[itemIdx].highlights.filter((_, i) => i !== hIdx) }; onChange(next); };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}>
          <span style={{ fontSize: 13 }}>No education entries yet</span>
        </div>
      )}
      {data.map((item, index) => (
        <ResumeEntryCard key={item.id} title={item.degree || "New Degree"} subtitle={item.institution || undefined} isExpanded={expandedIds.has(item.id)} onToggle={() => toggleExpanded(item.id)} onDelete={() => removeItem(item.id)}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`edu-inst-${item.id}`}>Institution</label><input id={`edu-inst-${item.id}`} type="text" value={item.institution} onChange={(e) => updateItem(index, { institution: e.target.value })} placeholder="MIT" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`edu-degree-${item.id}`}>Degree</label><input id={`edu-degree-${item.id}`} type="text" value={item.degree} onChange={(e) => updateItem(index, { degree: e.target.value })} placeholder="B.Tech Computer Science" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`edu-field-${item.id}`}>Field</label><input id={`edu-field-${item.id}`} type="text" value={item.field} onChange={(e) => updateItem(index, { field: e.target.value })} placeholder="Computer Science" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`edu-loc-${item.id}`}>Location</label><input id={`edu-loc-${item.id}`} type="text" value={item.location} onChange={(e) => updateItem(index, { location: e.target.value })} placeholder="Cambridge, MA" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`edu-start-${item.id}`}>Start Date</label><input id={`edu-start-${item.id}`} type="text" value={item.startDate} onChange={(e) => updateItem(index, { startDate: e.target.value })} placeholder="Aug 2018" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`edu-end-${item.id}`}>End Date</label><input id={`edu-end-${item.id}`} type="text" value={item.endDate} onChange={(e) => updateItem(index, { endDate: e.target.value })} placeholder="May 2022" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`edu-gpa-${item.id}`}>GPA</label><input id={`edu-gpa-${item.id}`} type="text" value={item.gpa} onChange={(e) => updateItem(index, { gpa: e.target.value })} placeholder="3.8/4.0" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            {/* Highlights */}
            <div>
              <span style={{ ...LABEL_STYLE, marginBottom: 8, display: "block" }}>Highlights</span>
              <div className="flex flex-col gap-2">
                {item.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex items-center gap-2">
                    <span className="shrink-0" style={{ color: "#454647", fontSize: 8 }}>●</span>
                    <input type="text" value={h} onChange={(e) => updateHighlight(index, hIdx, e.target.value)} placeholder="Dean's list, research paper..." style={{ ...INPUT_STYLE, flex: 1 }} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" aria-label={`Highlight ${hIdx + 1}`} />
                    <button onClick={() => removeHighlight(index, hIdx)} className="shrink-0" style={{ color: "#ff8c8c" }} aria-label="Remove"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addHighlight(index)} className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: "#9c9c9d", border: "1px dashed rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent" }}><Plus size={12} />Add highlight</button>
            </div>
          </div>
        </ResumeEntryCard>
      ))}
      <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}><Plus size={14} />Add Education</button>
    </div>
  );
}
