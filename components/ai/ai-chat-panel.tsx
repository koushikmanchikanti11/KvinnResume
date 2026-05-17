import React, { useState } from 'react';
import { PixelButton } from '@/components/pixel/pixel-button';
import { PixelBadge } from '@/components/pixel/pixel-badge';

export function AIChatPanel() {
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-full bg-kr-surface-3 pixel-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-kr-border flex items-center justify-between bg-kr-surface">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-kr-ai-violet animate-pulse" />
          <span className="font-display font-semibold text-kr-text text-sm">Resume Assistant</span>
        </div>
        <PixelBadge variant="violet">AI_READY</PixelBadge>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {/* Example System Message */}
        <div className="flex justify-start">
          <div className="bg-[rgba(184,146,255,0.12)] border border-[rgba(184,146,255,0.35)] text-[#d8c7ff] text-sm rounded-lg p-3 max-w-[85%]">
            Hello! I can help you rewrite summaries, add measurable impacts, or optimize for ATS. What would you like to improve?
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="text-xs font-mono bg-kr-bg-deep border border-kr-border text-kr-text-muted px-2 py-1 rounded hover:border-kr-ai-violet hover:text-kr-ai-violet transition-colors">
            &gt; Rewrite summary
          </button>
          <button className="text-xs font-mono bg-kr-bg-deep border border-kr-border text-kr-text-muted px-2 py-1 rounded hover:border-kr-ai-violet hover:text-kr-ai-violet transition-colors">
            &gt; Optimize for ATS
          </button>
        </div>
      </div>

      <div className="p-3 bg-kr-surface border-t border-kr-border">
        <div className="flex items-center gap-2 relative">
          <input 
            type="text" 
            placeholder="Ask AI to improve section..."
            className="w-full bg-kr-bg-deep border border-kr-border rounded-lg py-2 px-3 text-sm text-kr-text focus:outline-none focus:border-kr-ai-violet transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <PixelButton variant="primary" size="sm" className="shrink-0 bg-[rgba(184,146,255,0.12)] text-[#d8c7ff] border-[rgba(184,146,255,0.35)] hover:bg-[rgba(184,146,255,0.2)]">
            Send
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
