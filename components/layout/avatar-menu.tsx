"use client";

import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, CreditCard, User } from "lucide-react";

export function AvatarMenu() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  const initials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user.email?.charAt(0).toUpperCase() ||
    "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="outline-none cursor-pointer"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#1b1c1e",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 600,
          color: "#f3f3f3",
          fontFamily: "var(--font-jetbrains), monospace",
        }}
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        style={{
          width: "220px",
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "13px",
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel style={{ fontWeight: 400, padding: "12px 14px" }}>
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#f3f3f3" }}>
                {user.user_metadata?.full_name || "User"}
              </p>
              <p style={{ fontSize: "12px", color: "#6a6b6c" }}>
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          style={{ padding: "8px 14px", color: "#9c9c9d", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          style={{ padding: "8px 14px", color: "#9c9c9d", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/billing")}
          style={{ padding: "8px 14px", color: "#9c9c9d", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
        <DropdownMenuItem
          onClick={handleSignOut}
          style={{ padding: "8px 14px", color: "#ff8c8c", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
