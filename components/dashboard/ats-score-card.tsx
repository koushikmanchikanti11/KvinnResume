export function ATSScoreCard() {
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
          ATS SCORE
        </span>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {/* Score display */}
        <div className="flex items-baseline gap-2" style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              color: "#454647",
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            —
          </span>
          <span style={{ fontSize: "14px", color: "#454647", fontFamily: "var(--font-jetbrains), monospace" }}>
            / 100
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#6a6b6c", marginBottom: "16px" }}>
          No ATS data available
        </p>

        {/* Checklist preview - empty */}
        <div className="space-y-2">
          {["Keywords", "Section hierarchy", "Action verbs", "Measurable results"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#454647",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "13px", color: "#454647" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
