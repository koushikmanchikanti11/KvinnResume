import React from 'react';

export type ParserMode = 'fast' | 'agentic' | 'deep' | 'auto';

interface ParserModeSelectorProps {
  selectedMode: ParserMode;
  onSelect: (mode: ParserMode) => void;
}

export function ParserModeSelector({ selectedMode, onSelect }: ParserModeSelectorProps) {
  const modes = [
    {
      id: 'fast',
      label: 'Cost Effective',
      uiLabel: 'FAST_SCAN',
      desc: 'Quick standard extraction. Best for simple resumes.',
      speed: 'Fast',
      accuracy: 'Good',
    },
    {
      id: 'agentic',
      label: 'Agentic',
      uiLabel: 'SMART_PARSE',
      desc: 'AI-assisted extraction. Best for messy formats.',
      speed: 'Medium',
      accuracy: 'High',
    },
    {
      id: 'deep',
      label: 'High Accuracy',
      uiLabel: 'DEEP_SCAN',
      desc: 'Reducto vision processing. Best for complex PDFs.',
      speed: 'Slow',
      accuracy: 'Maximum',
    },
    {
      id: 'auto',
      label: 'Auto (Recommended)',
      uiLabel: 'AUTO_ROUTE',
      desc: 'Tries fast scan first, falls back to deep scan if needed.',
      speed: 'Variable',
      accuracy: 'Optimal',
    }
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modes.map((mode) => {
        const isSelected = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`
              flex flex-col text-left p-4 rounded-xl border transition-all duration-160
              ${isSelected 
                ? 'bg-kr-surface-2 border-kr-pixel-green shadow-[0_0_15px_rgba(126,231,135,0.1)]' 
                : 'bg-kr-surface border-kr-border hover:border-kr-text-dim hover:bg-kr-surface-2'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-semibold text-kr-text">{mode.label}</span>
              <span className={`text-[10px] font-pixel px-1.5 py-0.5 rounded border ${isSelected ? 'text-kr-pixel-green border-kr-pixel-green' : 'text-kr-text-muted border-kr-border'}`}>
                {mode.uiLabel}
              </span>
            </div>
            
            <p className="text-xs text-kr-text-muted mb-4 flex-1">
              {mode.desc}
            </p>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-kr-text-dim">Speed</span>
                <span className={isSelected ? 'text-kr-text' : 'text-kr-text-muted'}>{mode.speed}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-kr-text-dim">Accuracy</span>
                <span className={isSelected ? 'text-kr-text' : 'text-kr-text-muted'}>{mode.accuracy}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
