import Link from "next/link";
import { AvatarMenu } from "./avatar-menu";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardNavbar() {
  return (
    <nav
      className="sticky top-0 z-50 hidden md:flex items-center justify-between"
      style={{
        height: "64px",
        background: "rgba(7, 8, 10, 0.9)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        padding: "0 20px",
      }}
    >
      {/* Left: Logo + Name + BETA chip */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: "28px",
              height: "28px",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              position: "relative",
            }}
          >
            <span style={{ color: "#f3f3f3", fontWeight: 700, fontSize: "16px", lineHeight: 1 }}>K</span>
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "4px",
                height: "4px",
                background: "#e7c59a",
                borderRadius: "1px",
              }}
            />
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#f3f3f3" }} className="hidden sm:inline-block font-display">
            KvinnResume
          </span>
        </Link>
        <span
          className="hidden sm:inline-flex"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#e7c59a",
            background: "rgba(231, 197, 154, 0.1)",
            border: "1px solid rgba(231, 197, 154, 0.2)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "var(--font-jetbrains), monospace",
          }}
        >
          BETA
        </span>
      </div>

      {/* Right: Credits pill + Notifications + Avatar */}
      <div className="flex items-center gap-3">
        {/* Credits Pill */}
        <div
          className="hidden sm:flex items-center gap-1.5"
          style={{
            background: "#111214",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "12px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontWeight: 500,
            color: "#f3f3f3",
          }}
        >
          <span style={{ color: "#e7c59a", fontSize: "10px" }}>◆</span>
          <span>0 CREDITS</span>
        </div>

        {/* Notification Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
          }}
        >
          <Bell className="size-4" style={{ color: "#9c9c9d" }} />
        </Button>

        {/* Avatar */}
        <AvatarMenu />
      </div>
    </nav>
  );
}
