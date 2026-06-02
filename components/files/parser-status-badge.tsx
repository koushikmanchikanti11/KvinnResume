"use client";

export type ParseStatus =
  | "idle"
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

type ParserStatusBadgeProps = {
  status: ParseStatus;
};

function getStatusMeta(status: ParseStatus) {
  switch (status) {
    case "idle":
      return {
        label: "Idle",
        dot: "#454647",
        animated: false,
        duration: "0ms",
      };

    case "pending":
      return {
        label: "Pending",
        dot: "#e7c59a",
        animated: true,
        duration: "1.4s",
      };

    case "running":
      return {
        label: "Running",
        dot: "#56c2ff",
        animated: true,
        duration: "1.0s",
      };

    case "completed":
      return {
        label: "Completed",
        dot: "#00ac5c",
        animated: false,
        duration: "0ms",
      };

    case "failed":
      return {
        label: "Failed",
        dot: "#ff6363",
        animated: false,
        duration: "0ms",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        dot: "#6a6b6c",
        animated: false,
        duration: "0ms",
      };
  }
}

export function ParserStatusBadge({ status }: ParserStatusBadgeProps) {
  const meta = getStatusMeta(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        height: "22px",
        padding: "0 8px",
        background: "#1b1c1e",
        borderRadius: "6px",
        color: "#9c9c9d",
        fontFamily:
          "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        fontSize: "11px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <style>
        {`
          @keyframes parser-status-dot-pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
            100% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .parser-status-dot-animated {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>

      <span
        className={meta.animated ? "parser-status-dot-animated" : undefined}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          flexShrink: 0,
          background: meta.dot,
          animation: meta.animated
            ? `parser-status-dot-pulse ${meta.duration} ease-in-out infinite`
            : undefined,
        }}
      />

      <span>{meta.label}</span>
    </span>
  );
}

export default ParserStatusBadge;