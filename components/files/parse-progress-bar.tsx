"use client";

import React from "react";
import { X } from "lucide-react";

interface ParseProgressBarProps {
  status: "idle" | "pending" | "running" | "parsing_complete" | "completed" | "failed" | "cancelled";
  progress: number;
  label: string;
  onCancel?: () => void;
}

export function ParseProgressBar({ status, progress, label, onCancel }: ParseProgressBarProps) {
  if (status === "idle") return null;

  const isActive = status === "pending" || status === "running" || status === "parsing_complete";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <div className="w-full rounded-xl bg-[#07080a] border border-white/[0.08] p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {/* Status dot */}
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isCompleted
                ? "bg-[#00ac5c] shadow-[0_0_6px_rgba(0,172,92,0.5)]"
                : isFailed
                ? "bg-[#ff6363] shadow-[0_0_6px_rgba(255,99,99,0.5)]"
                : "bg-[#e7c59a] shadow-[0_0_6px_rgba(231,197,154,0.4)] animate-pulse"
            }`}
          />
          {/* Status label */}
          <span className="font-mono text-xs uppercase tracking-wider text-[#f3f3f3]">
            {label}
            {isActive && (
              <span className="ml-1.5 text-[#9c9c9d]">{progress}%</span>
            )}
          </span>
        </div>

        {/* Cancel button — only while active */}
        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono uppercase text-[#9c9c9d] hover:text-[#ff6363] hover:bg-white/5 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar track */}
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCompleted
              ? "bg-[#00ac5c]"
              : isFailed
              ? "bg-[#ff6363]"
              : "bg-[#e7c59a]"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Blinking cursor while active */}
      {isActive && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#e7c59a] animate-[blink_1s_steps(1)_infinite]" />
          <span className="font-mono text-[10px] text-[#9c9c9d] uppercase tracking-wider">
            {status === "pending" && "Initializing parser engine..."}
            {status === "running" && "Extracting text from document..."}
            {status === "parsing_complete" && "Running AI structuring pipeline..."}
          </span>
        </div>
      )}

      {/* Completed message */}
      {isCompleted && (
        <p className="mt-3 font-mono text-[10px] text-[#00ac5c] uppercase tracking-wider">
          ✓ Resume parsed and structured successfully. Redirecting to editor...
        </p>
      )}

      {/* Failed message */}
      {isFailed && (
        <p className="mt-3 font-mono text-[10px] text-[#ff6363] uppercase tracking-wider">
          ✗ Parse failed. You can retry or try a different mode.
        </p>
      )}
    </div>
  );
}
