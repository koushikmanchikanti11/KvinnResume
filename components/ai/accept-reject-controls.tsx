"use client";

import { Check, Loader2, Pencil, RefreshCw } from "lucide-react";

interface AcceptRejectControlsProps {
    onAccept: () => void;
    onTryAgain: () => void;
    onEdit: () => void;
    isLoading?: boolean;
    size?: "sm" | "md";
}

export default function AcceptRejectControls({
    onAccept,
    onTryAgain,
    onEdit,
    isLoading = false,
    size = "sm",
}: AcceptRejectControlsProps) {
    const height = size === "sm" ? "26px" : "30px";
    const fontSize = size === "sm" ? "12px" : "13px";
    const marginTop = size === "sm" ? "8px" : "12px";
    const iconSize = size === "sm" ? 12 : 13;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop,
                opacity: isLoading ? 0.4 : 1,
                pointerEvents: isLoading ? "none" : "auto",
            }}
        >
            <style>
                {`
          @keyframes ai-controls-spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ai-controls-spinner {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
            </style>

            <button
                type="button"
                disabled={isLoading}
                onClick={onAccept}
                className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
                style={{
                    height,
                    padding: "0 10px",
                    background: "transparent",
                    border: "1px solid rgba(89,212,153,0.25)",
                    borderRadius: "6px",
                    color: "#59d499",
                    fontSize,
                    fontWeight: 500,
                    fontFamily: "Inter, system-ui, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition:
                        "background 160ms ease, border-color 160ms ease, transform 120ms ease",
                }}
                onMouseEnter={(event) => {
                    if (isLoading) return;
                    event.currentTarget.style.background = "rgba(89,212,153,0.08)";
                    event.currentTarget.style.borderColor = "rgba(89,212,153,0.4)";
                }}
                onMouseLeave={(event) => {
                    if (isLoading) return;
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.borderColor = "rgba(89,212,153,0.25)";
                }}
                onMouseDown={(event) => {
                    if (isLoading) return;
                    event.currentTarget.style.transform = "translateY(1px)";
                }}
                onMouseUp={(event) => {
                    if (isLoading) return;
                    event.currentTarget.style.transform = "translateY(0)";
                }}
            >
                <Check size={iconSize} />
                Accept
            </button>

            <GhostActionButton
                label="Try again"
                icon={
                    isLoading ? (
                        <Loader2
                            size={iconSize}
                            className="ai-controls-spinner"
                            style={{
                                animation: "ai-controls-spin 1s linear infinite",
                            }}
                        />
                    ) : (
                        <RefreshCw size={iconSize} />
                    )
                }
                height={height}
                fontSize={fontSize}
                isLoading={isLoading}
                onClick={onTryAgain}
            />

            <GhostActionButton
                label="Edit"
                icon={<Pencil size={iconSize} />}
                height={height}
                fontSize={fontSize}
                isLoading={isLoading}
                onClick={onEdit}
            />
        </div>
    );
}

function GhostActionButton({
    label,
    icon,
    height,
    fontSize,
    isLoading,
    onClick,
}: {
    label: string;
    icon: React.ReactNode;
    height: string;
    fontSize: string;
    isLoading: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            disabled={isLoading}
            onClick={onClick}
            className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[rgba(231,197,154,0.6)]"
            style={{
                height,
                padding: "0 10px",
                background: "transparent",
                border: "none",
                borderRadius: "6px",
                color: "#9c9c9d",
                fontSize,
                fontWeight: 400,
                fontFamily: "Inter, system-ui, sans-serif",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background 160ms ease, color 160ms ease, transform 120ms ease",
            }}
            onMouseEnter={(event) => {
                if (isLoading) return;
                event.currentTarget.style.background = "rgba(255,255,255,0.04)";
                event.currentTarget.style.color = "#f3f3f3";
            }}
            onMouseLeave={(event) => {
                if (isLoading) return;
                event.currentTarget.style.background = "transparent";
                event.currentTarget.style.color = "#9c9c9d";
            }}
            onMouseDown={(event) => {
                if (isLoading) return;
                event.currentTarget.style.transform = "translateY(1px)";
            }}
            onMouseUp={(event) => {
                if (isLoading) return;
                event.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {icon}
            {label}
        </button>
    );
}