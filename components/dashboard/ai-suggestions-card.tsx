import { Sparkles } from "lucide-react";

export function AISuggestionsCard() {
  return (
    <div
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px 10px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#6a6b6c",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase",
          }}
        >
          AI SUGGESTIONS
        </span>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {/* Empty state */}
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ padding: "24px 16px" }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(141, 107, 255, 0.06)",
              border: "1px solid rgba(141, 107, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={18} style={{ color: "#8d6bff" }} />
          </div>
          <p style={{ fontSize: "13px", color: "#6a6b6c" }}>
            Upload a resume to get AI suggestions
          </p>
        </div>
      </div>
    </div>
  );
}
