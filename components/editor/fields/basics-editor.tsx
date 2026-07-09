"use client";

import React from "react";
import type { ResumeData } from "@/lib/resume/schema";

/**
 * BasicsEditor — Edit contact info fields.
 */

interface BasicsEditorProps {
  data: ResumeData["basics"];
  onChange: (updated: ResumeData["basics"]) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  fontSize: 14,
  color: "#f3f3f3",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  outline: "none",
  fontFamily: "var(--font-inter), Inter, sans-serif",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontFamily:
    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#6a6b6c",
  marginBottom: 6,
};

const FIELDS: { key: keyof ResumeData["basics"]; label: string; placeholder: string }[] = [
  { key: "fullName", label: "Full Name", placeholder: "John Doe" },
  { key: "headline", label: "Headline", placeholder: "Full Stack Developer" },
  { key: "email", label: "Email", placeholder: "john@example.com" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "location", label: "Location", placeholder: "Hyderabad, India" },
  { key: "website", label: "Website", placeholder: "https://johndoe.dev" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/johndoe" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/johndoe" },
  { key: "portfolio", label: "Portfolio", placeholder: "https://portfolio.johndoe.dev" },
];

export function BasicsEditor({ data, onChange }: BasicsEditorProps) {
  const handleChange = (key: keyof ResumeData["basics"], value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Full name & headline — side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.slice(0, 2).map((field) => (
          <div key={field.key}>
            <label style={LABEL_STYLE} htmlFor={`basics-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`basics-${field.key}`}
              type="text"
              value={data[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={{
                ...INPUT_STYLE,
                ...(document.activeElement?.id === `basics-${field.key}`
                  ? {}
                  : {}),
              }}
              className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
            />
          </div>
        ))}
      </div>

      {/* Email & phone — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.slice(2, 4).map((field) => (
          <div key={field.key}>
            <label style={LABEL_STYLE} htmlFor={`basics-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`basics-${field.key}`}
              type={field.key === "email" ? "email" : "text"}
              value={data[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={INPUT_STYLE}
              className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
            />
          </div>
        ))}
      </div>

      {/* Remaining fields */}
      {FIELDS.slice(4).map((field) => (
        <div key={field.key}>
          <label style={LABEL_STYLE} htmlFor={`basics-${field.key}`}>
            {field.label}
          </label>
          <input
            id={`basics-${field.key}`}
            type="text"
            value={data[field.key] || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={INPUT_STYLE}
            className="focus:ring-1 focus:ring-[rgba(231,197,154,0.5)]"
          />
        </div>
      ))}
    </div>
  );
}
