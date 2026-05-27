import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-kv-border-soft border-dashed rounded-xl p-12 bg-kv-surface-3 flex flex-col items-center justify-center text-center", className)}>
      {icon && (
        <div className="w-16 h-16 bg-kv-surface-2 rounded-xl flex items-center justify-center border border-kv-border-soft mb-4">
          <div className="text-kv-text-muted">{icon}</div>
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-kv-text-primary mb-2">{title}</h3>
      <p className="text-[14px] text-kv-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
