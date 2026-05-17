import { File } from "lucide-react";

export function RecentFilesCard() {
  return (
    <div
      style={{
        background: "#111214",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
        }}
      >
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
          RECENT FILES
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
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <File size={18} style={{ color: "#454647" }} />
          </div>
          <p style={{ fontSize: "13px", color: "#6a6b6c" }}>
            No files uploaded yet
          </p>
        </div>
      </div>
    </div>
  );
}
