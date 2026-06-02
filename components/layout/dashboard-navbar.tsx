"use client";

import Link from "next/link";
import { AvatarMenu } from "./avatar-menu";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/use-credits";

export function DashboardNavbar() {
  const { credits, loading } = useCredits();

  return (
    <nav
      className="hidden md:flex"
      style={{
        height: "64px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: "#040506",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      {/* Left: Logo + Name + BETA chip */}
      <div
        className="flex items-center gap-3"
        style={{
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          style={{
            textDecoration: "none",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: "28px",
              height: "28px",
              background: "#e6e6e6",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#2f3031",
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              K
            </span>

            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "4px",
                height: "4px",
                background: "#e7c59a",
                borderRadius: "1px",
              }}
            />
          </div>

          <span
            className="hidden sm:inline-block font-display"
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#f3f3f3",
              whiteSpace: "nowrap",
            }}
          >
            KvinnResume
          </span>
        </Link>

        <span
          className="hidden sm:inline-flex"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#e7c59a",
            background: "rgba(231,197,154,0.1)",
            border: "1px solid rgba(231,197,154,0.2)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "var(--font-jetbrains), monospace",
            whiteSpace: "nowrap",
          }}
        >
          BETA
        </span>
      </div>

      {/* Right: Credits pill + Notifications + Avatar */}
      <div
        className="flex items-center gap-3"
        style={{
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        <div
          className="hidden sm:flex items-center gap-1.5"
          style={{
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "0 12px",
            height: "34px",
            fontSize: "12px",
            fontFamily: "var(--font-jetbrains), monospace",
            fontWeight: 500,
            color: "#f3f3f3",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? (
            <span
              className="animate-pulse"
              style={{
                color: "#6a6b6c",
              }}
            >
              LOADING...
            </span>
          ) : (
            <>
              <span
                style={{
                  color:
                    credits && credits.credits_balance <= 0
                      ? "#ff6363"
                      : "#e7c59a",
                  fontSize: "10px",
                }}
              >
                ◆
              </span>

              <span>
                {credits ? credits.credits_balance.toLocaleString() : "..."} CREDITS
              </span>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            flexShrink: 0,
          }}
        >
          <Bell className="size-4" style={{ color: "#9c9c9d" }} />
        </Button>

        <div style={{ flexShrink: 0 }}>
          <AvatarMenu />
        </div>
      </div>
    </nav>
  );
}