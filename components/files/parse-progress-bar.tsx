"use client";

import { useEffect, useRef, useState } from "react";
import type { ParseStatus } from "./parser-status-badge";

interface ParseProgressBarProps {
  status: ParseStatus;
  progress: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md";
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getDefaultLabel(status: ParseStatus) {
  switch (status) {
    case "idle":
      return "Idle";
    case "pending":
      return "Queued…";
    case "running":
      return "Parsing…";
    case "completed":
      return "Complete";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Idle";
  }
}

function getLabelColor(status: ParseStatus) {
  if (status === "failed") return "#ff6363";
  if (status === "completed") return "#00ac5c";
  return "#9c9c9d";
}

function getFillColor(status: ParseStatus, progress: number) {
  if (status === "idle") return "#454647";
  if (status === "pending") return "#e7c59a";
  if (status === "completed") return "#00ac5c";
  if (status === "failed") return "#ff6363";
  if (status === "cancelled") return "#454647";

  if (progress >= 90) return "#00ac5c";
  if (progress >= 70) return "#ff8f3d";

  return "#e7c59a";
}

function getFillWidth(status: ParseStatus, progress: number) {
  if (status === "idle") return 0;
  if (status === "pending") return 40;
  if (status === "completed") return 100;
  if (status === "failed") return 100;
  if (status === "cancelled") return progress;

  return progress;
}

export function ParseProgressBar({
  status,
  progress,
  label,
  showPercentage = true,
  size = "md",
}: ParseProgressBarProps) {
  const value = clampProgress(progress);
  const previousStatusRef = useRef<ParseStatus>(status);
  const [completedFlash, setCompletedFlash] = useState(false);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (previousStatus !== "completed" && status === "completed") {
      const startTimer = window.setTimeout(() => {
        setCompletedFlash(true);
      }, 600);

      const stopTimer = window.setTimeout(() => {
        setCompletedFlash(false);
      }, 1000);

      previousStatusRef.current = status;

      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(stopTimer);
      };
    }

    previousStatusRef.current = status;
  }, [status]);

  const displayLabel = label ?? getDefaultLabel(status);
  const fillColor = getFillColor(status, value);
  const fillWidth = getFillWidth(status, value);
  const trackHeight = size === "sm" ? "3px" : "5px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      }}
    >
      <style>
        {`
          @keyframes parse-progress-shimmer {
            0% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.5;
            }
          }

          @keyframes parse-progress-complete-flash {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .parse-progress-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            color: getLabelColor(status),
            whiteSpace: "nowrap",
          }}
        >
          {displayLabel}
        </span>

        {status === "running" && showPercentage && (
          <span
            style={{
              fontSize: "11px",
              fontFamily:
                "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
              color: "#6a6b6c",
              whiteSpace: "nowrap",
            }}
          >
            {value}%
          </span>
        )}
      </div>

      <div
        style={{
          width: "100%",
          height: trackHeight,
          background: "#1b1c1e",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          className={
            status === "pending" || completedFlash
              ? "parse-progress-animated"
              : undefined
          }
          style={{
            width: `${fillWidth}%`,
            height: "100%",
            borderRadius: "2px",
            background: fillColor,
            transition: "width 300ms ease, background-color 300ms ease",
            animation:
              status === "pending"
                ? "parse-progress-shimmer 1.4s ease-in-out infinite"
                : completedFlash
                  ? "parse-progress-complete-flash 400ms ease-in-out 1"
                  : undefined,
          }}
        />
      </div>
    </div>
  );
}

export default ParseProgressBar;