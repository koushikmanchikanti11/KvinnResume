"use client";

import React from "react";
import Link from "next/link";
import { AuthTerminalPreview } from "./AuthTerminalPreview";

interface AuthShellProps {
  children: React.ReactNode;
  headerText?: string;
  headerHref?: string;
  terminalLogs?: string[];
}

export function AuthShell({
  children,
  headerText = "Need help? View demo",
  headerHref = "#",
  terminalLogs = [],
}: AuthShellProps) {
  return (
    <div className="auth-page-bg relative min-h-screen w-full overflow-y-auto overflow-x-hidden text-gray-100 flex flex-col pb-safe">
      <div className="auth-glow-green top-10 left-10 hidden lg:block" />
      <div className="auth-glow-violet bottom-10 right-10 hidden lg:block" />

      {/* Header */}
      <header className="auth-mobile-header lg:h-20 lg:px-12 relative z-10 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-[34px] h-[34px] lg:w-9 lg:h-9 bg-[#101312] pixel-border flex items-center justify-center font-bold text-[#7ee787] shadow-inner transition-transform group-hover:scale-105">
            K
          </div>
          <span className="font-semibold tracking-tight text-white/90">KvinnResume</span>
        </Link>
        <div className="auth-mobile-header-links text-sm text-gray-400 hover:text-white transition-colors">
          <Link href={headerHref}>{headerText}</Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center lg:justify-between px-4 lg:px-12 py-6 lg:py-12 gap-12 lg:gap-8 relative z-10">
        
        {/* Left Side (Desktop/Tablet) */}
        <div className="hidden lg:flex flex-col justify-center flex-1 w-full max-w-lg">
          <AuthTerminalPreview logs={terminalLogs} />
        </div>

        {/* Right Side / Mobile Center */}
        <div className="w-full flex flex-col justify-center items-center lg:items-end flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
