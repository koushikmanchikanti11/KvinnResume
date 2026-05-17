import { FileText } from "lucide-react";

export function ActiveResumeCard() {
  return (
    <DashboardCard title="ACTIVE RESUME">
      {/* Empty state */}
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: "32px 16px" }}
      >
        <div
          style={{
            width: "48px",
            height: "64px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <FileText size={20} style={{ color: "#454647" }} />
        </div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#9c9c9d", marginBottom: "4px" }}>
          No resumes yet
        </p>
        <p style={{ fontSize: "13px", color: "#6a6b6c" }}>
          Upload your first resume or create one from scratch.
        </p>
      </div>
    </DashboardCard>
  );
}

/* Shared dashboard card wrapper */
function DashboardCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
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
          {title}
        </span>
        {action}
      </div>
      <div style={{ padding: "0 16px 16px" }}>{children}</div>
    </div>
  );
}
