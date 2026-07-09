"use client";

import React from "react";
import { Download } from "lucide-react";

export function PdfExportButton() {
  const handlePdfExport = () => {
    // Scaffolded for Phase 9
    alert("PDF Export is coming soon in Phase 9!");
  };

  return (
    <button
      onClick={handlePdfExport}
      className="hidden md:flex items-center gap-1.5 rounded-md transition-colors px-2.5"
      style={{
        height: 32,
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#f3f3f3",
        fontSize: 12,
        fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
      }}
      title="Coming soon"
    >
      <Download size={13} />
      PDF
    </button>
  );
}
