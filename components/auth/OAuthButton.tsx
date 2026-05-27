"use client";

import React from "react";

interface OAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "Google" | "GitHub" | "Discord";
  isLoading?: boolean;
}

export function OAuthButton({ provider, isLoading, disabled, ...props }: OAuthButtonProps) {
  const iconSrc = 
    provider === "Google" ? "https://www.svgrepo.com/show/475656/google-color.svg" :
    provider === "GitHub" ? "https://www.svgrepo.com/show/512317/github-142.svg" :
    "https://www.svgrepo.com/show/353655/discord-icon.svg";

  return (
    <button
      type="button"
      className="oauth-button"
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 rounded-full border-2 border-gray-400 border-t-white" />
          Connecting {provider}...
        </span>
      ) : (
        <>
          <img src={iconSrc} alt={`${provider} icon`} className="w-[18px] h-[18px] object-contain dark:invert-[0.9]" style={provider === 'Google' ? { filter: 'none' } : provider === 'Discord' ? { filter: 'invert(1)' } : {}} />
          Continue with {provider}
        </>
      )}
    </button>
  );
}
