"use client";

export function CreditsUsageCard() {
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
          AI CREDITS
        </span>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {/* Credit balance */}
        <div style={{ marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              color: "#f3f3f3",
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            0
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#6a6b6c", marginBottom: "16px" }}>
          Next reset: —
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            style={{
              flex: 1,
              height: "32px",
              borderRadius: "8px",
              background: "#1b1c1e",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f3f3f3",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 160ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#222325"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#1b1c1e"; }}
          >
            Buy Credits
          </button>
          <button
            style={{
              flex: 1,
              height: "32px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9c9c9d",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 160ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f3f3f3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9c9c9d"; }}
          >
            View Usage
          </button>
        </div>
      </div>
    </div>
  );
}
