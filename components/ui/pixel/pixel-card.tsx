import { cn } from "@/lib/utils";

export function PixelCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-kv-border-soft rounded-xl p-5 bg-kv-surface-3 relative overflow-hidden transition-colors hover:border-kv-border-mid",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
