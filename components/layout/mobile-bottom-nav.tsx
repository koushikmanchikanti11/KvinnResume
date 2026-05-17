"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  File,
  FileText,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const bottomNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Files", href: "/files", icon: File },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "AI", href: "/ai-chat", icon: MessageSquare },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <nav
      className="flex md:hidden items-center justify-around pb-safe"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "64px",
        background: "rgba(7, 8, 10, 0.95)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {bottomNavItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center"
            style={{
              flex: 1,
              height: "100%",
              textDecoration: "none",
              position: "relative",
              gap: "4px",
              transition: "color 160ms ease",
              color: active ? "#7ee787" : "#6a6b6c",
            }}
          >
            {/* Active indicator dot */}
            {active && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#7ee787",
                }}
              />
            )}
            <item.icon
              size={20}
              style={{
                marginTop: active ? "4px" : "0",
                color: active ? "#7ee787" : "#6a6b6c",
                transition: "color 160ms ease",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 600 : 500,
                fontFamily: "var(--font-jetbrains), monospace",
                letterSpacing: "0.04em",
              }}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
