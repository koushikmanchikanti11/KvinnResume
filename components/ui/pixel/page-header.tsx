import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.04em] text-kv-text-primary mb-1 flex items-center gap-2">
          {icon && <span className="text-kv-text-muted">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="text-[14px] text-kv-text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
