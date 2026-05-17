"use client";

import React, { useState } from 'react';
import { PixelButton } from '@/components/pixel/pixel-button';

interface ResumeSectionCardProps {
  title: string;
  children: React.ReactNode;
  isSaved?: boolean;
}

export function ResumeSectionCard({ title, children, isSaved = true }: ResumeSectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative p-5 bg-kr-surface pixel-border rounded-xl group transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-semibold text-kr-text tracking-tight">{title}</h3>
          {!isSaved && (
            <span className="w-2 h-2 rounded-full bg-kr-terminal-amber animate-pulse" title="Unsaved changes" />
          )}
        </div>
        
        <div className={`flex items-center gap-2 transition-opacity duration-160 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <PixelButton size="sm" className="h-7 text-xs px-2 bg-transparent hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">Edit</PixelButton>
          <PixelButton size="sm" className="h-7 text-xs px-2 text-kr-ai-violet bg-transparent hover:text-[#d8c7ff] hover:bg-[rgba(184,146,255,0.12)] border border-[rgba(184,146,255,0.2)]">AI Rewrite</PixelButton>
        </div>
      </div>
      
      <div className="text-kr-text-muted text-sm leading-relaxed">
        {children}
      </div>
      
      {/* Keyboard Shortcut Hint */}
      {isHovered && (
        <div className="absolute top-2 right-2 text-[10px] font-mono text-kr-text-dim px-1.5 py-0.5 bg-kr-bg-deep rounded border border-kr-border opacity-50">
          ⌘E
        </div>
      )}
    </div>
  );
}
