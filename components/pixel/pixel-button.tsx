// TODO: Pixel-styled pressable button with keyboard key effect
// Uses key-button CSS class from design system

import { cn } from "@/lib/utils";

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "green" | "amber" | "blue" | "violet" | "red";
  size?: "sm" | "md" | "lg";
}

export function PixelButton({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn("key-button font-display font-semibold", className)}
      {...props}
    >
      {children}
    </button>
  );
}
