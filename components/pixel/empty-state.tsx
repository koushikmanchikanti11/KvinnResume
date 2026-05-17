// TODO: Pixel empty state block
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-pixel text-sm text-kr-dim tracking-widest mb-2">{title}</p>
      {description && <p className="text-kr-muted text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
