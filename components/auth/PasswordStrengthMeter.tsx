"use client";

import React from "react";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const evaluateStrength = () => {
    if (!password) return { score: 0, label: "WEAK", color: "bg-gray-700" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3) return { score: 1, label: "WEAK", color: "bg-red-500" };
    if (score >= 3 && score < 5) return { score: 2, label: "GOOD", color: "bg-yellow-400" };
    return { score: 3, label: "STRONG", color: "bg-[#7ee787]" };
  };

  const { score, label, color } = evaluateStrength();

  // We have 8 blocks total for the UI
  // WEAK: 2 blocks
  // GOOD: 5 blocks
  // STRONG: 8 blocks
  const activeBlocks = score === 1 ? 2 : score === 2 ? 5 : score === 3 ? 8 : 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-[11px] font-mono tracking-wide text-gray-400">
        <span>PASSWORD_STRENGTH:</span>
        <span className={score === 3 ? "text-[#7ee787]" : score === 2 ? "text-yellow-400" : score === 1 ? "text-red-500" : ""}>
          {label}
        </span>
      </div>
      <div className="flex gap-[2px] h-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-full rounded-sm transition-colors duration-300 ${
              i < activeBlocks ? color : "bg-[#171b22]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
