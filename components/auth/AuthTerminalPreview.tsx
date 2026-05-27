"use client";

import React, { useEffect, useState } from "react";

interface AuthTerminalPreviewProps {
  logs?: string[];
}

export function AuthTerminalPreview({ logs = [] }: AuthTerminalPreviewProps) {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!logs.length) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setDisplayedLogs((prev) => [...prev, logs[currentIndex]]);
      currentIndex++;
      if (currentIndex >= logs.length) clearInterval(interval);
    }, 400);

    return () => clearInterval(interval);
  }, [logs]);

  return (
    <div className="w-full flex flex-col gap-6 font-mono">
      {/* Terminal Window */}
      <div className="w-full rounded-xl bg-[#0b0d10]/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="h-8 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="ml-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">BOOT_SEQUENCE</div>
        </div>
        <div className="p-5 text-sm text-[#9aa3a0] leading-relaxed min-h-[140px] flex flex-col">
          {displayedLogs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[#7ee787] mr-2">{">"}</span>
              {log}
            </div>
          ))}
          <div className="mt-2 animate-pulse w-2 h-4 bg-[#7ee787]" />
        </div>
      </div>

      {/* Mini Resume Preview Card */}
      <div className="w-full rounded-xl bg-gradient-to-b from-[#11141a]/80 to-[#0b0d10]/80 border border-white/5 p-6 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#b892ff]/10 rounded-full blur-3xl group-hover:bg-[#b892ff]/20 transition-colors" />
        
        <h3 className="text-xl font-bold text-white mb-1">Kiran Koushik</h3>
        <p className="text-gray-400 text-sm mb-4">Frontend Developer</p>
        <div className="text-xs text-gray-500 mb-6">Skills: React · Next.js · Supabase · Tailwind</div>
        
        {/* Status Chips */}
        <div className="flex flex-wrap gap-2">
          <div className="px-2 py-1 rounded bg-[#7ee787]/10 text-[#7ee787] text-[10px] uppercase font-bold tracking-wider border border-[#7ee787]/20">
            AI_READY
          </div>
          <div className="px-2 py-1 rounded bg-[#72ddf7]/10 text-[#72ddf7] text-[10px] uppercase font-bold tracking-wider border border-[#72ddf7]/20">
            ATS_SAFE
          </div>
          <div className="px-2 py-1 rounded bg-[#b892ff]/10 text-[#b892ff] text-[10px] uppercase font-bold tracking-wider border border-[#b892ff]/20">
            PDF_READY
          </div>
        </div>
      </div>

      {/* Grid of Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-white/5 bg-[#0b0d10]/50 flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">ATS_SCORE</span>
          <span className="text-[#7ee787] font-bold">89/100</span>
        </div>
        <div className="p-4 rounded-lg border border-white/5 bg-[#0b0d10]/50 flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">PUBLISHED</span>
          <span className="text-[#72ddf7] font-bold">YES</span>
        </div>
      </div>
    </div>
  );
}
