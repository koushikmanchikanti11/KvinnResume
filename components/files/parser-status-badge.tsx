import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function ParserStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "unparsed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kv-surface-2 border border-kv-border-soft text-[10px] uppercase font-mono text-kv-text-muted">
        <Clock className="w-3 h-3" />
        Unparsed
      </div>
    );
  }

  if (status === "pending" || status === "running" || status === "parsing_complete") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase font-mono text-blue-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        {status === "parsing_complete" ? "Structuring AI" : "Parsing"}
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] uppercase font-mono text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] uppercase font-mono text-red-400">
      <AlertCircle className="w-3 h-3" />
      Failed
    </div>
  );
}
