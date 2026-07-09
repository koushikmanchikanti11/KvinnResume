"use client";

import React from "react";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

const THEMES = [
  { id: "pixel", name: "Pixel", description: "Default terminal aesthetic" },
  { id: "modern", name: "Modern", description: "Clean & minimal" },
  { id: "premium", name: "Premium", description: "High contrast executive" },
  { id: "casual", name: "Casual", description: "Approachable & creative" },
];

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="px-4 pt-4">
        <span
          style={{
            fontSize: 10,
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#6a6b6c",
          }}
        >
          Theme
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4">
        {THEMES.map((theme) => {
          const isActive = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className="relative flex flex-col items-start text-left p-3 rounded-lg transition-all"
              style={{
                background: isActive ? "rgba(231,197,154,0.08)" : "#040506",
                border: isActive
                  ? "1px solid #e7c59a"
                  : "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: isActive ? "#e7c59a" : "#f3f3f3",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  marginBottom: 4,
                }}
              >
                {theme.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#6a6b6c",
                  fontFamily:
                    "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
                  lineHeight: 1.4,
                }}
              >
                {theme.description}
              </span>

              {isActive && (
                <div
                  className="absolute top-3 right-3 flex items-center justify-center rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    background: "#e7c59a",
                    color: "#040506",
                  }}
                >
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
