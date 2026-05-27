import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardNavbar } from "./dashboard-navbar";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileDrawer } from "./mobile-drawer";
import { MobileBottomNav } from "./mobile-bottom-nav";

/**
 * DashboardShell — App Shell Layout (Design Doc Section 4)
 *
 * Desktop (≥768px):
 *   nav.dashboard-navbar    height: 64px, sticky top: 0
 *   .dashboard-body         flex row
 *     aside.sidebar         width: 248px, sticky top: 64px
 *     main.dashboard-main   flex: 1, padding: 24px
 *
 * Mobile (<768px):
 *   MobileTopBar            height: 56px, sticky top: 0
 *   MobileDrawer            slide-in hamburger overlay
 *   main.dashboard-main     full width, pb for bottom nav
 *   MobileBottomNav          fixed bottom bar
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dashboard-shell"
      style={{
        minHeight: "100vh",
        background: "#040506",
        color: "#f3f3f3",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden", // Prevent horizontal scroll
      }}
    >
      {/* Desktop navbar — hidden on mobile */}
      <DashboardNavbar />

      {/* Mobile top bar — hidden on desktop */}
      <MobileTopBar />

      {/* Mobile drawer overlay */}
      <MobileDrawer />

      <div className="dashboard-body flex flex-1 items-start">
        {/* Desktop sidebar */}
        <DashboardSidebar />

        <main
          className="dashboard-main flex-1 w-full min-h-[calc(100vh-64px)] p-4 pb-20 md:p-6 md:pb-6"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileBottomNav />
    </div>
  );
}
