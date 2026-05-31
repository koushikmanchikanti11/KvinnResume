"use client"

import { AIModelAlias, AI_MODEL_DISPLAY } from "@/types/ai"

interface AIModelSelectorProps {
  value: AIModelAlias
  onChange: (model: AIModelAlias) => void
  disabled?: boolean
}

export function AIModelSelector({ value, onChange, disabled }: AIModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AIModelAlias)}
      disabled={disabled}
      style={{
        background: "#1b1c1e",
        border: "1px solid rgba(255,255,255,0.08)",
        height: "28px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        color: "#9c9c9d",
        borderRadius: "6px",
        padding: "0 8px",
        outline: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <option value="nano_3">{AI_MODEL_DISPLAY.nano_3}</option>
      <option value="nano_25">{AI_MODEL_DISPLAY.nano_25}</option>
    </select>
  )
}
