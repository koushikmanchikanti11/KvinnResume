import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardNavbar } from "./dashboard-navbar";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileDrawer } from "./mobile-drawer";
import { MobileBottomNav } from "./mobile-bottom-nav";

/**
 * DashboardShell — App Shell Layout
 *
 * Desktop (≥768px):
 * - DashboardNavbar stays at top
 * - Sidebar sits below navbar inside the body flex row
 * - Main content sits beside sidebar, not under it
 *
 * Mobile (<768px):
 * - MobileTopBar is visible
 * - Sidebar is hidden by DashboardSidebar itself
 * - MobileDrawer handles full menu
 * - MobileBottomNav is fixed at bottom
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dashboard-shell"
      style={{
        minHeight: "100vh",
        background: "#040506",
        color: "#f3f3f3",
        overflowX: "hidden",
      }}
    >
      {/* Desktop navbar — hidden on mobile inside DashboardNavbar */}
      <DashboardNavbar />

      {/* Mobile top bar — hidden on desktop inside MobileTopBar */}
      <MobileTopBar />

      {/* Mobile drawer overlay */}
      <MobileDrawer />

      {/* Desktop/mobile body wrapper */}
      <div
        className="dashboard-body flex w-full"
        style={{
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Desktop sidebar */}
        <DashboardSidebar />

        {/* Main content */}
        <main className="dashboard-main min-w-0 flex-1 px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop inside MobileBottomNav */}
      <MobileBottomNav />
    </div>
  );
}