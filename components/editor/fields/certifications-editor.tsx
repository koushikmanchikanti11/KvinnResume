"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import type { ResumeData, ResumeCertificationItem } from "@/lib/resume/schema";
import { ResumeEntryCard } from "../resume-entry-card";

interface CertificationsEditorProps {
  data: ResumeData["certifications"];
  onChange: (updated: ResumeData["certifications"]) => void;
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

export function CertificationsEditor({ data, onChange }: CertificationsEditorProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => { setExpandedIds((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const updateItem = (i: number, u: Partial<ResumeCertificationItem>) => { const n = [...data]; n[i] = { ...n[i], ...u }; onChange(n); };
  const addItem = () => { const id = crypto.randomUUID(); onChange([...data, { id, name: "", issuer: "", date: "", url: "" }]); setExpandedIds((p) => new Set(p).add(id)); };
  const removeItem = (id: string) => { onChange(data.filter((x) => x.id !== id)); };

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && (<div className="flex flex-col items-center justify-center py-8 rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "#454647" }}><span style={{ fontSize: 13 }}>No certifications yet</span></div>)}
      {data.map((item, index) => (
        <ResumeEntryCard key={item.id} title={item.name || "New Certification"} subtitle={item.issuer || undefined} isExpanded={expandedIds.has(item.id)} onToggle={() => toggleExpanded(item.id)} onDelete={() => removeItem(item.id)}>
          <div className="flex flex-col gap-3">
            <div><label style={LABEL_STYLE} htmlFor={`cert-name-${item.id}`}>Certification Name</label><input id={`cert-name-${item.id}`} type="text" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} placeholder="AWS Solutions Architect" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label style={LABEL_STYLE} htmlFor={`cert-issuer-${item.id}`}>Issuer</label><input id={`cert-issuer-${item.id}`} type="text" value={item.issuer} onChange={(e) => updateItem(index, { issuer: e.target.value })} placeholder="Amazon Web Services" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
              <div><label style={LABEL_STYLE} htmlFor={`cert-date-${item.id}`}>Date</label><input id={`cert-date-${item.id}`} type="text" value={item.date} onChange={(e) => updateItem(index, { date: e.target.value })} placeholder="Mar 2024" style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
            </div>
            <div><label style={LABEL_STYLE} htmlFor={`cert-url-${item.id}`}>Credential URL</label><input id={`cert-url-${item.id}`} type="text" value={item.url} onChange={(e) => updateItem(index, { url: e.target.value })} placeholder="https://..." style={INPUT_STYLE} className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]" /></div>
          </div>
        </ResumeEntryCard>
      ))}
      <button onClick={addItem} className="flex items-center justify-center gap-2 rounded-lg" style={{ height: 40, background: "#111214", border: "1px solid rgba(255,255,255,0.1)", color: "#f3f3f3", fontSize: 13, fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace", cursor: "pointer" }}><Plus size={14} />Add Certification</button>
    </div>
  );
}
