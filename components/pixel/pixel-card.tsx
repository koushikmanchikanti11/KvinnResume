// TODO: Pixel border obsidian card
import { cn } from "@/lib/utils";

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function PixelCard({ className, glow, children, ...props }: PixelCardProps) {
  return (
    <div
      className={cn(
        glow ? "pixel-glow-card" : "pixel-border",
        "rounded-xl p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
