"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/stores/ui-store";
import { SidebarNavItem, SidebarSectionLabel } from "./sidebar-nav-item";
import {
  LayoutDashboard,
  File,
  FileText,
  MessageSquare,
  LayoutTemplate,
  CreditCard,
  BarChart,
  Settings,
  Link2,
  HelpCircle,
  ListOrdered,
  Upload,
  Plus,
  LogOut,
  X,
} from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Files", href: "/files", icon: File },
  { name: "My Resumes", href: "/resumes", icon: FileText },
  { name: "AI Chat", href: "/ai-chat", icon: MessageSquare },
  { name: "Templates", href: "/templates", icon: LayoutTemplate },
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

export function MobileDrawer() {
  const { isMobileDrawerOpen, closeDrawer } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen, closeDrawer]);

  const handleSignOut = async () => {
    closeDrawer();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AnimatePresence>
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            onClick={closeDrawer}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 70,
              width: "80vw",
              maxWidth: "320px",
              background: "linear-gradient(180deg, #07080a 0%, #040506 100%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between"
              style={{
                height: "56px",
                padding: "0 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}
            >
              <div className="flex items-center gap-2">
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
                  style={{ fontWeight: 700, fontSize: "15px", color: "#f3f3f3" }}
                  className="font-display"
                >
                  KvinnResume
                </span>
              </div>

              <button
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#9c9c9d",
                  transition: "background 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation content */}
            <div style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
              {/* MAIN Section */}
              <SidebarSectionLabel>MAIN</SidebarSectionLabel>
              <div className="space-y-0.5 mb-4">
                {mainNav.map((item) => (
                  <SidebarNavItem
                    key={item.name}
                    href={item.href}
                    icon={item.icon}
                    label={item.name}
                    active={isActive(item.href)}
                    onClick={closeDrawer}
                  />
                ))}
              </div>

              {/* CREATE Section */}
              <SidebarSectionLabel>CREATE</SidebarSectionLabel>
              <div
                className="mb-4"
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <button
                  onClick={closeDrawer}
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
                  onClick={closeDrawer}
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
              <SidebarSectionLabel>MANAGE</SidebarSectionLabel>
              <div className="space-y-0.5 mb-4">
                {manageNav.map((item) => (
                  <SidebarNavItem
                    key={item.name}
                    href={item.href}
                    icon={item.icon}
                    label={item.name}
                    active={isActive(item.href)}
                    onClick={closeDrawer}
                  />
                ))}
              </div>

              {/* SYSTEM Section */}
              <SidebarSectionLabel>SYSTEM</SidebarSectionLabel>
              <div className="space-y-0.5 mb-4">
                {systemNav.map((item) => (
                  <SidebarNavItem
                    key={item.name}
                    href={item.href}
                    icon={item.icon}
                    label={item.name}
                    active={isActive(item.href)}
                    onClick={closeDrawer}
                  />
                ))}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Logout button */}
              <button
                onClick={handleSignOut}
                style={{
                  width: "100%",
                  height: "38px",
                  borderRadius: "8px",
                  background: "rgba(255, 92, 122, 0.08)",
                  color: "#ff8ca2",
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 12px",
                  border: "1px solid rgba(255, 92, 122, 0.15)",
                  cursor: "pointer",
                  transition: "background 160ms ease",
                  marginTop: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 92, 122, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 92, 122, 0.08)";
                }}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
