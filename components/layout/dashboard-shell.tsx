import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardNavbar } from "./dashboard-navbar";
import { MobileTopBar } from "./mobile-top-bar";
import { MobileDrawer } from "./mobile-drawer";
import { MobileBottomNav } from "./mobile-bottom-nav";

const SIDEBAR_WIDTH = 264;
const NAVBAR_HEIGHT = 64;
const CONTENT_GAP = 36;

/**
 * DashboardShell — Fixed Navbar + Fixed Sidebar Layout
 *
 * Desktop:
 * - Navbar fixed at top.
 * - Sidebar fixed below navbar.
 * - Main content starts after sidebar.
 *
 * Mobile:
 * - Sidebar hidden.
 * - Mobile top bar visible.
 * - Main content full width.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#040506] text-[#f3f3f3]"
      style={{
        minHeight: "100vh",
        background: "#040506",
        color: "#f3f3f3",
        overflowX: "hidden",
      }}
    >
      <DashboardNavbar />
      <MobileTopBar />
      <MobileDrawer />

      <DashboardSidebar />

      {/* Desktop main */}
      <main
        className="hidden min-w-0 md:block"
        style={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          minHeight: "100vh",
          paddingTop: `${NAVBAR_HEIGHT + 24}px`,
          paddingRight: "32px",
          paddingBottom: "32px",
          paddingLeft: `${CONTENT_GAP}px`,
          background: "#040506",
        }}
      >
        <div
          style={{
            width: "100%",
            minWidth: 0,
          }}
        >
          {children}
        </div>
      </main>

      {/* Mobile main */}
      <main
        className="block min-w-0 md:hidden"
        style={{
          width: "100%",
          minHeight: "100vh",
          paddingTop: "16px",
          paddingRight: "16px",
          paddingBottom: "88px",
          paddingLeft: "16px",
          background: "#040506",
        }}
      >
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}