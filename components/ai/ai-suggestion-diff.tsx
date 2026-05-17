import React from 'react';
import { PixelButton } from '@/components/pixel/pixel-button';
import { StatusChip } from '@/components/pixel/status-chip';

interface AISuggestionDiffProps {
  beforeText: string;
  afterText: string;
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
}

export function AISuggestionDiff({ beforeText, afterText, onAccept, onReject, onRegenerate }: AISuggestionDiffProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-kr-surface-2 pixel-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <StatusChip status="ai" label="AI Rewrite Suggestion" />
        <div className="flex gap-2">
          <PixelButton variant="ghost" size="sm" onClick={onRegenerate}>Regenerate</PixelButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-kr-text-dim text-xs font-mono mb-1">BEFORE</span>
          <div className="p-3 bg-kr-bg-deep rounded-md border border-kr-border line-through text-kr-text-muted">
            {beforeText}
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-kr-pixel-green text-xs font-mono mb-1">AFTER</span>
          <div className="p-3 bg-[rgba(184,146,255,0.05)] rounded-md border border-[rgba(184,146,255,0.2)] text-kr-text">
            {afterText}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-2">
        <PixelButton variant="ghost" size="sm" onClick={onReject}>Reject</PixelButton>
        <PixelButton variant="primary" size="sm" onClick={onAccept}>Accept Changes</PixelButton>
      </div>
    </div>
  );
}
