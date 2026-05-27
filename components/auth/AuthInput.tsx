"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col w-full">
        <label className="mb-1.5 text-sm font-medium text-gray-200">{label}</label>
        <div className="relative w-full flex items-center">
          <input
            ref={ref}
            type={currentType}
            className={`auth-input ${className}`}
            data-error={!!error}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee787] rounded"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <div className="auth-error-text" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
