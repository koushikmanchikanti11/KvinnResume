"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ResumeData, ResumeProjectItem } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

interface ProjectsEditorProps {
  data: ResumeData["projects"];
  onChange: (updated: ResumeData["projects"]) => void;
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

export function ProjectsEditor({ data, onChange }: ProjectsEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => { setExpandedIds((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const updateItem = (i: number, u: Partial<ResumeProjectItem>) => { const n = [...data]; n[i] = { ...n[i], ...u }; onChange(n); };
  const addItem = () => { const id = crypto.randomUUID(); onChange([...data, { id, name: "", description: "", url: "", technologies: [], highlights: [], startDate: "", endDate: "" }]); setExpandedIds((p) => new Set(p).add(id)); };
  const removeItem = (id: string) => { onChange(data.filter((x) => x.id !== id)); };

  const addHighlight = (i: number) => { const n = [...data]; n[i] = { ...n[i], highlights: [...n[i].highlights, ""] }; onChange(n); };
  const updateHighlight = (i: number, h: number, v: string) => { const n = [...data]; const hl = [...n[i].highlights]; hl[h] = v; n[i] = { ...n[i], highlights: hl }; onChange(n); };
  const removeHighlight = (i: number, h: number) => { const n = [...data]; n[i] = { ...n[i], highlights: n[i].highlights.filter((_, idx) => idx !== h) }; onChange(n); };

  const handleTechChange = (i: number, value: string) => {
    updateItem(i, { technologies: value.split(",").map((t) => t.trim()).filter(Boolean) });
  };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (<div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}><span style={{ fontSize: 13 }}>No projects yet</span></div>)}
      {data.map((item, index) => (
        <ResumeEntryCard key={item.id} title={item.name || "New Project"} subtitle={item.technologies.length > 0 ? item.technologies.join(", ") : undefined} isExpanded={expandedIds.has(item.id)} onToggle={() => toggleExpanded(item.id)} onDelete={() => removeItem(item.id)}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`proj-name-${item.id}`}>Name</label><input id={`proj-name-${item.id}`} type="text" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} placeholder="Project Name" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`proj-url-${item.id}`}>URL</label><input id={`proj-url-${item.id}`} type="text" value={item.url} onChange={(e) => updateItem(index, { url: e.target.value })} placeholder="https://github.com/..." style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            <div><label style={LABEL_STYLE} htmlFor={`proj-desc-${item.id}`}>Description</label><textarea id={`proj-desc-${item.id}`} value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} placeholder="Brief project description..." style={{ width: "100%", minHeight: 60, padding: "10px 12px", fontSize: 14, color: "#f3f3f3", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, outline: "none", fontFamily: "var(--font-inter), Inter, sans-serif", resize: "vertical" as const }} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            <div><label style={LABEL_STYLE} htmlFor={`proj-tech-${item.id}`}>Technologies (comma-separated)</label><input id={`proj-tech-${item.id}`} type="text" value={item.technologies.join(", ")} onChange={(e) => handleTechChange(index, e.target.value)} placeholder="React, TypeScript, Node.js" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`proj-start-${item.id}`}>Start</label><input id={`proj-start-${item.id}`} type="text" value={item.startDate} onChange={(e) => updateItem(index, { startDate: e.target.value })} placeholder="Jan 2023" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`proj-end-${item.id}`}>End</label><input id={`proj-end-${item.id}`} type="text" value={item.endDate} onChange={(e) => updateItem(index, { endDate: e.target.value })} placeholder="Present" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            {/* Highlights */}
            <div>
              <span style={{ ...LABEL_STYLE, marginBottom: 8, display: "block" }}>Highlights</span>
              <div className="flex flex-col gap-2">
                {item.highlights.map((h, hIdx) => (<div key={hIdx} className="flex items-center gap-2"><span className="shrink-0" style={{ color: "#454647", fontSize: 8 }}>●</span><input type="text" value={h} onChange={(e) => updateHighlight(index, hIdx, e.target.value)} placeholder="Key achievement..." style={{ ...INPUT_STYLE, flex: 1 }} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /><button onClick={() => removeHighlight(index, hIdx)} style={{ color: "#ff8c8c" }} aria-label="Remove"><X size={12} /></button></div>))}
              </div>
              <button onClick={() => addHighlight(index)} className="flex items-center gap-1.5 mt-2" style={{ fontSize: 12, color: "#9c9c9d", border: "1px dashed rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent" }}><Plus size={12} />Add highlight</button>
            </div>
          </div>
        </ResumeEntryCard>
      ))}
      <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}><Plus size={14} />Add Project</button>
    </div>
  );
}
