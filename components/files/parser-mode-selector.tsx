import React from 'react';

export type ParserMode = 'nano' | 'nano_mini' | 'nano_pro' | 'auto';

interface ParserModeSelectorProps {
  selectedMode: ParserMode;
  onSelect: (mode: ParserMode) => void;
}

export function ParserModeSelector({ selectedMode, onSelect }: ParserModeSelectorProps) {
  const modes = [
    {
      id: 'nano',
      label: 'Nano',
    },
    {
      id: 'nano_mini',
      label: 'Nano Mini',
    },
    {
      id: 'nano_pro',
      label: 'Nano Pro',
    },
    {
      id: 'auto',
      label: 'Auto',
    }
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modes.map((mode) => {
        const isSelected = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id as ParserMode)}
            className={`
              flex items-center justify-center p-4 rounded-xl border transition-all duration-160
              ${isSelected 
                ? 'bg-kv-surface-2 border-kv-pixel-green shadow-[0_0_15px_rgba(126,231,135,0.1)] text-kv-text-primary' 
                : 'bg-kv-surface border-kv-border-soft hover:border-kv-text-muted hover:bg-kv-surface-2 text-kv-text-muted'}
            `}
          >
            <span className="font-display font-semibold">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
