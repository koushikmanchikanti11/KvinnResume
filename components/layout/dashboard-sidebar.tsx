"use client";

import { useCredits } from "@/hooks/use-credits";
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

const SIDEBAR_WIDTH = 264;
const NAVBAR_HEIGHT = 64;

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
      className="hidden md:flex"
      style={{
        width: "264px",
        height: "calc(100vh - 64px)",
        position: "fixed",
        top: "64px",
        left: 0,
        zIndex: 45,
        flexDirection: "column",
        background: "linear-gradient(180deg, #07080a 0%, #040506 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}
    >
      <nav
        className="dashboard-sidebar-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 12px",
        }}
      >
        <SectionLabel>MAIN</SectionLabel>
        <div className="mb-4 space-y-0.5">
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

        <SectionLabel>CREATE</SectionLabel>
        <div className="mb-4 flex flex-col gap-3">
          <CreateButton href="/files" variant="primary" icon={<Upload size={14} />}>
            UPLOAD RESUME
          </CreateButton>

          <CreateButton href="/editor/new" variant="secondary" icon={<Plus size={14} />}>
            NEW RESUME
          </CreateButton>
        </div>

        <SectionLabel>MANAGE</SectionLabel>
        <div className="mb-4 space-y-0.5">
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

        <SectionLabel>SYSTEM</SectionLabel>
        <div className="space-y-0.5">
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
      </nav>

      <footer
        style={{
          flexShrink: 0,
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "linear-gradient(180deg, rgba(4,5,6,0.72) 0%, #040506 100%)",
        }}
      >
        <SidebarCreditsMeter />
      </footer>
    </aside>
  );
}

function CreateButton({
  href,
  variant,
  icon,
  children,
}: {
  href: string;
  variant: "primary" | "secondary";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      style={{
        width: "100%",
        height: "36px",
        borderRadius: "8px",
        background: isPrimary ? "#e6e6e6" : "transparent",
        color: isPrimary ? "#2f3031" : "#f3f3f3",
        fontSize: "12px",
        fontWeight: isPrimary ? 600 : 500,
        letterSpacing: "0.04em",
        fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        border: isPrimary ? "none" : "1px solid rgba(255,255,255,0.12)",
        cursor: "pointer",
        textDecoration: "none",
        boxShadow: isPrimary
          ? "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "none",
        transition:
          "background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
      }}
      onMouseEnter={(event) => {
        if (isPrimary) return;
        event.currentTarget.style.background = "rgba(255,255,255,0.04)";
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.20)";
      }}
      onMouseLeave={(event) => {
        if (isPrimary) return;
        event.currentTarget.style.background = "transparent";
        event.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
      onMouseDown={(event) => {
        event.currentTarget.style.transform = "translateY(1px)";
        if (isPrimary) {
          event.currentTarget.style.boxShadow =
            "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
        }
      }}
      onMouseUp={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        if (isPrimary) {
          event.currentTarget.style.boxShadow =
            "0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
        }
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

function SidebarCreditsMeter() {
  const { credits, loading } = useCredits();

  const balance = credits?.credits_balance ?? 0;
  const used = credits?.monthly_ai_credits_used ?? 0;
  const plan = credits?.plan ?? "free";

  const baseLimit = plan === "premium" ? 2000 : plan === "pro" ? 1000 : 50;

  const totalCredits = Math.max(baseLimit, balance + used, balance, 1);
  const balancePercentage = Math.max(0, Math.min(100, (balance / totalCredits) * 100));

  const isLow = balancePercentage <= 20;
  const isMedium = balancePercentage > 20 && balancePercentage <= 50;

  const barColor = isLow ? "#ff6363" : isMedium ? "#e7c59a" : "#00ac5c";

  return (
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
          color: "#454647",
          fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        CREDITS BALANCE
      </div>

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
            width: loading ? "0%" : `${balancePercentage}%`,
            height: "100%",
            background: barColor,
            borderRadius: "3px",
            transition: "width 300ms ease, background-color 300ms ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          fontSize: "11px",
          fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
          color: "#9c9c9d",
        }}
      >
        {loading ? (
          <span className="animate-pulse">Loading...</span>
        ) : credits ? (
          <>
            <span>{balance.toLocaleString()}</span>
            <span style={{ color: "#6a6b6c" }}>/ {totalCredits.toLocaleString()}</span>
          </>
        ) : (
          <span>---</span>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: "#454647",
        fontFamily: "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
        textTransform: "uppercase",
        padding: "4px 12px",
        marginBottom: "4px",
      }}
    >
      {children}
    </div>
  );
}

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
        border: active
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid transparent",
        textDecoration: "none",
        position: "relative",
        transition:
          "background 160ms ease, color 160ms ease, border-color 160ms ease",
        overflow: "hidden",
      }}
      onMouseEnter={(event) => {
        if (!active) {
          event.currentTarget.style.background = "rgba(255,255,255,0.04)";
          event.currentTarget.style.color = "#f3f3f3";
        }
      }}
      onMouseLeave={(event) => {
        if (!active) {
          event.currentTarget.style.background = "transparent";
          event.currentTarget.style.color = "#9c9c9d";
        }
      }}
    >
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

      <Icon
        size={16}
        style={{
          flexShrink: 0,
          color: active ? "#ffffff" : "#9c9c9d",
        }}
      />

      <span className="min-w-0 flex-1 truncate">{label}</span>

      {shortcut && (
        <span
          style={{
            fontSize: "11px",
            fontFamily:
              "var(--font-jetbrains), var(--font-mono), JetBrains Mono, monospace",
            color: "#6a6b6c",
            flexShrink: 0,
          }}
        >
          {shortcut}
        </span>
      )}
    </Link>
  );
}