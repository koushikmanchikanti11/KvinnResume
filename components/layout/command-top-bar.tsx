import React from 'react';
import { PixelButton } from '@/components/pixel/pixel-button';

export function CommandTopBar() {
  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-kr-surface/80 backdrop-blur-md border-b border-kr-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Logo area */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-kr-pixel-green rounded-sm" />
          <span className="font-pixel text-lg text-kr-text tracking-widest uppercase">Kvinn</span>
        </div>
        
        {/* Environment/Status indicator */}
        <div className="hidden md:flex items-center gap-2 ml-4 text-xs font-mono text-kr-text-dim bg-kr-bg-deep px-2 py-1 rounded border border-kr-border">
          <span className="w-1.5 h-1.5 bg-kr-pixel-green rounded-full animate-pulse" />
          workspace_active
        </div>
      </div>

      {/* Center Search / Command Palette Trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button className="w-full flex items-center justify-between bg-kr-bg-deep border border-kr-border hover:border-kr-text-dim rounded-md px-3 py-1.5 text-sm text-kr-text-muted transition-colors">
          <span>Search or type a command...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-kr-surface px-1.5 py-0.5 rounded border border-kr-border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Action buttons */}
        <PixelButton variant="ghost" size="sm" className="hidden sm:flex text-kr-resume-blue">
          Preview
        </PixelButton>
        <PixelButton variant="primary" size="sm">
          Publish
        </PixelButton>
        
        {/* User avatar placeholder */}
        <div className="w-8 h-8 rounded bg-kr-surface-3 border border-kr-border flex items-center justify-center ml-2 cursor-pointer hover:border-kr-text-dim transition-colors">
          <span className="font-display font-medium text-kr-text text-sm">US</span>
        </div>
      </div>
    </header>
  );
}
