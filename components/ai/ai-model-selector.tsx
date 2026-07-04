"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type AiModel = "nano_2_5" | "nano_3";

interface AiModelSelectorProps {
  value: AiModel;
  onChange: (value: AiModel) => void;
  disabled?: boolean;
}

const models: Array<{
  value: AiModel;
  label: string;
  description: string;
}> = [
  {
    value: "nano_2_5",
    label: "nano 2.5",
    description: "Fast • lower credit cost",
  },
  {
    value: "nano_3",
    label: "nano 3",
    description: "Smarter • higher quality",
  },
];

function getModelLabel(value: AiModel) {
  return models.find((model) => model.value === value)?.label ?? "nano 2.5";
}

export default function AiModelSelector({
  value,
  onChange,
  disabled = false,
}: AiModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSelect(nextValue: AiModel) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        display: "inline-flex",
      }}
    >
      <style>
        {`
          @keyframes ai-model-selector-fade {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-model-selector-animated {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          height: "28px",
          padding: "0 9px",
          background: "#1b1c1e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
          transition: "border-color 160ms ease, background 160ms ease",
        }}
        onMouseEnter={(event) => {
          if (disabled) return;

          event.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          event.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }}
        onMouseLeave={(event) => {
          if (disabled) return;

          event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          event.currentTarget.style.background = "#1b1c1e";
        }}
      >
        <span
          style={{
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
            fontSize: "11px",
            fontWeight: 500,
            color: "#9c9c9d",
            whiteSpace: "nowrap",
          }}
        >
          {getModelLabel(value)}
        </span>

        <ChevronDown
          size={11}
          style={{
            marginLeft: "2px",
            color: "#6a6b6c",
            transition: "transform 160ms ease",
            transform: open ? "rotate(-180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>

      {open && !disabled && (
        <div
          className="ai-model-selector-animated"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: 0,
            minWidth: "200px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "10px",
            padding: "6px",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
            zIndex: 40,
            animation: "ai-model-selector-fade 160ms ease",
          }}
        >
          {models.map((model) => {
            const selected = value === model.value;

            return (
              <button
                key={model.value}
                type="button"
                onClick={() => handleSelect(model.value)}
                style={{
                  width: "100%",
                  height: "52px",
                  padding: selected ? "0 10px 0 8px" : "0 10px",
                  borderRadius: "8px",
                  border: "none",
                  borderLeft: selected
                    ? "2px solid #8d6bff"
                    : "2px solid transparent",
                  background: selected
                    ? "rgba(141,107,255,0.08)"
                    : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "3px",
                  transition: "background 120ms ease",
                  textAlign: "left",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = selected
                    ? "rgba(141,107,255,0.08)"
                    : "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = selected
                    ? "rgba(141,107,255,0.08)"
                    : "transparent";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#f3f3f3",
                    }}
                  >
                    {model.label}
                  </span>

                  {selected && (
                    <Check
                      size={13}
                      style={{
                        color: "#8d6bff",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </span>

                <span
                  style={{
                    fontFamily:
                      "var(--font-jetbrains), var(--font-mono), JetBrains Mono, IBM Plex Mono, monospace",
                    fontSize: "11px",
                    color: "#6a6b6c",
                  }}
                >
                  {model.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { AiModelSelector };