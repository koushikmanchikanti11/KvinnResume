"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  File,
  LayoutTemplate,
  MessageSquare,
  CreditCard,
  BarChart,
  Settings,
  Link2,
  HelpCircle,
  ListOrdered,
  Upload,
  Plus,
} from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
  { name: "Files", href: "/files", icon: File, shortcut: "⌘2" },
  { name: "My Resumes", href: "/resumes", icon: FileText, shortcut: "⌘3" },
  { name: "AI Chat", href: "/ai-chat", icon: MessageSquare, shortcut: "⌘4" },
  { name: "Templates", href: "/templates", icon: LayoutTemplate, shortcut: "⌘5" },
];

const manageNav = [
  { name: "Public Links", href: "/public-links", icon: Link2 },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const systemNav = [
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Changelog", href: "/changelog", icon: ListOrdered },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0"
      style={{
        width: "248px",
        height: "calc(100vh - 64px)",
        position: "sticky",
        top: "64px",
        background: "linear-gradient(180deg, #07080a 0%, #040506 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        padding: "16px 12px",
        overflowY: "auto",
      }}
    >
      {/* MAIN Section */}
      <SectionLabel>MAIN</SectionLabel>
      <div className="space-y-0.5 mb-4">
        {mainNav.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            shortcut={item.shortcut}
            active={isActive(item.href)}
          />
        ))}
      </div>

      {/* CREATE Section */}
      <SectionLabel>CREATE</SectionLabel>

      <div
        className="mb-4"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <button
          style={{
            width: "100%",
            height: "36px",
            borderRadius: "8px",
            background: "#e6e6e6",
            color: "#2f3031",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            border: "none",
            cursor: "pointer",
            boxShadow:
              "rgba(0,0,0,0.4) 0px 1.5px 0.5px 2.5px, rgb(0,0,0) 0px 0px 0.5px 1px, rgba(0,0,0,0.25) 0px 2px 1px 1px inset, rgba(255,255,255,0.2) 0px 1px 1px 1px inset",
          }}
        >
          <Upload size={14} />
          UPLOAD RESUME
        </button>

        <button
          style={{
            width: "100%",
            height: "36px",
            borderRadius: "8px",
            background: "transparent",
            color: "#f3f3f3",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase" as const,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          NEW RESUME
        </button>
      </div>

      {/* MANAGE Section */}
      <SectionLabel>MANAGE</SectionLabel>
      <div className="space-y-0.5 mb-4">
        {manageNav.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
          />
        ))}
      </div>

      {/* SYSTEM Section */}
      <SectionLabel>SYSTEM</SectionLabel>
      <div className="space-y-0.5 mb-4">
        {systemNav.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
          />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sidebar Footer: Credits Used Meter */}
      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: "#6a6b6c",
            fontFamily: "var(--font-jetbrains), monospace",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          CREDITS USED
        </div>
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "3px",
            marginBottom: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "0%",
              height: "100%",
              background: "#e7c59a",
              borderRadius: "3px",
              transition: "width 300ms ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-jetbrains), monospace",
            color: "#9c9c9d",
          }}
        >
          0 / 0
        </div>
      </div>
    </aside>
  );
}

/* Section Label */
function SectionLabel({ children }: { children: React.ReactNode }) {
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

/* Nav Item */
function NavItem({
  href,
  icon: Icon,
  label,
  shortcut,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  shortcut?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
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
