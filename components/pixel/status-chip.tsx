// TODO: Dot + mono label status chip
export function StatusChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-kr-muted">
      <span className={`w-2 h-2 rounded-full ${active ? "bg-kr-green" : "bg-kr-dim"}`} />
      {label}
    </div>
  );
}
