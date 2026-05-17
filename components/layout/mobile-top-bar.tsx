"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { AvatarMenu } from "./avatar-menu";

export function MobileTopBar() {
  const openDrawer = useUIStore((s) => s.openDrawer);

  return (
    <nav
      className="flex md:hidden items-center justify-between"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "56px",
        background: "rgba(7, 8, 10, 0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        padding: "0 16px",
      }}
    >
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={openDrawer}
          aria-label="Open navigation menu"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#f3f3f3",
            transition: "background 160ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Menu size={18} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          {/* K logo box */}
          <div
            className="flex items-center justify-center"
            style={{
              width: "26px",
              height: "26px",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              position: "relative",
            }}
          >
            <span style={{ color: "#f3f3f3", fontWeight: 700, fontSize: "14px", lineHeight: 1 }}>K</span>
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "3px",
                height: "3px",
                background: "#e7c59a",
                borderRadius: "1px",
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "15px",
              color: "#f3f3f3",
            }}
            className="font-display"
          >
            KvinnResume
          </span>
        </Link>
      </div>

      {/* Right: Credits + Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Compact Credits Pill */}
        <div
          className="flex items-center gap-1"
          style={{
            background: "#111214",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "11px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontWeight: 500,
            color: "#f3f3f3",
          }}
        >
          <span style={{ color: "#e7c59a", fontSize: "9px" }}>◆</span>
          <span>0</span>
        </div>

        {/* Avatar */}
        <AvatarMenu />
      </div>
    </nav>
  );
}
