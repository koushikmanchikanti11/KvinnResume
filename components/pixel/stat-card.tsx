// TODO: Large number metric card
export function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="pixel-border rounded-xl p-5 bg-kr-surface">
      <p className="text-xs font-pixel text-kr-muted tracking-wider uppercase mb-2">{label}</p>
      <p className="text-3xl font-display font-bold">
        {value}
        {unit && <span className="text-sm text-kr-dim ml-1">{unit}</span>}
      </p>
    </div>
  );
}
