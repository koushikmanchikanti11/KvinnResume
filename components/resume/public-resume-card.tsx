import React from 'react';
import { PixelBadge } from '@/components/pixel/pixel-badge';

interface PublicResumeCardProps {
  name: string;
  role: string;
  summary: string;
  visibility: 'public' | 'unlisted' | 'private';
}

export function PublicResumeCard({ name, role, summary, visibility }: PublicResumeCardProps) {
  return (
    <div className="bg-[#f4f7f5] dark:bg-kr-surface pixel-border rounded-xl p-6 md:p-8 max-w-3xl mx-auto shadow-lg relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kr-resume-blue to-kr-ai-violet" />
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 pt-2">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-kr-text tracking-tight mb-2">
            {name}
          </h1>
          <h2 className="text-lg md:text-xl text-gray-600 dark:text-kr-text-muted font-medium">
            {role}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <PixelBadge variant={visibility === 'public' ? 'green' : visibility === 'unlisted' ? 'amber' : 'red'}>
            {visibility.toUpperCase()}
          </PixelBadge>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-kr-text border-b border-gray-200 dark:border-kr-border pb-2 mb-4">
          Professional Summary
        </h3>
        <p className="text-gray-700 dark:text-kr-text-muted leading-relaxed text-sm md:text-base">
          {summary}
        </p>
      </div>
      
      {/* Additional sections would be rendered here via children or props */}
      <div className="flex flex-col gap-6">
        {/* Placeholder for experience/projects grid */}
        <div className="h-24 bg-gray-100 dark:bg-kr-surface-2 rounded border border-gray-200 dark:border-kr-border border-dashed flex items-center justify-center text-sm text-gray-400 dark:text-kr-text-dim">
          Experience Section
        </div>
        <div className="h-24 bg-gray-100 dark:bg-kr-surface-2 rounded border border-gray-200 dark:border-kr-border border-dashed flex items-center justify-center text-sm text-gray-400 dark:text-kr-text-dim">
          Projects Section
        </div>
      </div>
    </div>
  );
}
