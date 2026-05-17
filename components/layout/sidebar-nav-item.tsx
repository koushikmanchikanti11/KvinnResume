"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        height: "38px",
        padding: "0 12px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        color: active ? "#ffffff" : "#9c9c9d",
        background: active ? "#111214" : "transparent",
        border: active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        textDecoration: "none",
        position: "relative",
        transition: "background 160ms ease, color 160ms ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#f3f3f3";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#9c9c9d";
        }
      }}
    >
      {/* Amber left rail for active */}
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "8px",
            bottom: "8px",
            width: "2px",
            background: "#e7c59a",
            borderRadius: "1px",
          }}
        />
      )}
      <Icon size={16} style={{ flexShrink: 0, color: active ? "#ffffff" : "#9c9c9d" }} />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-jetbrains), monospace",
            color: "#6a6b6c",
          }}
        >
          {shortcut}
        </span>
      )}
    </Link>
  );
}

/* Section Label */
export function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: "#6a6b6c",
        fontFamily: "var(--font-jetbrains), monospace",
        textTransform: "uppercase",
        padding: "4px 12px",
        marginBottom: "4px",
      }}
    >
      {children}
    </div>
  );
}
