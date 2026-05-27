"use client";

import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  badgeText: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, badgeText, children }: AuthCardProps) {
  return (
    <div className="auth-card flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <div className="inline-block px-2 py-1 mb-4 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-[#7ee787] border border-[#7ee787]/30 bg-[#7ee787]/10 rounded shadow-sm">
          {badgeText}
        </div>
        <h1 className="auth-title font-bold text-white mb-2">{title}</h1>
        <p className="auth-subtitle text-gray-400">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {children}
      </div>
      
      {/* Trust Badge at bottom */}
      <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#7ee787] shadow-[0_0_8px_rgba(126,231,135,0.6)]" />
        ENCRYPTED_SESSION
      </div>
    </div>
  );
}
