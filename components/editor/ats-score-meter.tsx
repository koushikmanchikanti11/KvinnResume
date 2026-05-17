import React from 'react';
import { PixelButton } from '@/components/pixel/pixel-button';

interface ATSMetric {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  issue?: string;
  status: 'good' | 'warning' | 'error';
}

interface ATSScoreMeterProps {
  overallScore: number;
  metrics: ATSMetric[];
}

export function ATSScoreMeter({ overallScore, metrics }: ATSScoreMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-kr-pixel-green';
    if (score >= 50) return 'text-kr-terminal-amber';
    return 'text-kr-error-red';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <div className="w-2 h-2 rounded-none bg-kr-pixel-green" />;
      case 'warning': return <div className="w-2 h-2 rounded-none bg-kr-terminal-amber" />;
      case 'error': return <div className="w-2 h-2 rounded-none bg-kr-error-red" />;
    }
  };

  return (
    <div className="bg-kr-surface-2 pixel-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-kr-border pb-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-kr-text">ATS Diagnostic</h3>
          <p className="text-xs text-kr-text-dim mt-1 font-mono">system.health_check()</p>
        </div>
        <div className={`font-pixel text-4xl ${getScoreColor(overallScore)}`}>
          {overallScore}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-start justify-between gap-4 p-2 bg-kr-surface rounded-lg border border-kr-border">
            <div className="flex items-start gap-3 pt-1.5">
              {getStatusIcon(metric.status)}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-kr-text">{metric.label}</span>
                {metric.issue && (
                  <span className="text-xs text-kr-text-muted mt-0.5">{metric.issue}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-kr-text-dim">
                {metric.score}/{metric.maxScore}
              </span>
              {metric.status !== 'good' && (
                <PixelButton variant="ghost" size="sm" className="h-6 text-[10px] px-2 py-0 border border-kr-border">
                  Fix
                </PixelButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
