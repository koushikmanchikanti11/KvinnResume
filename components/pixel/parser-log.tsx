// TODO: Terminal-style log output for parser status
export function ParserLog({ lines = [] }: { lines?: string[] }) {
  return (
    <div className="bg-kr-deep rounded-lg p-4 font-mono text-xs space-y-1 pixel-border">
      {lines.map((line, i) => (
        <div key={i} className="text-kr-green">{`> ${line}`}</div>
      ))}
      {lines.length === 0 && (
        <div className="text-kr-dim">{">"} waiting for input...</div>
      )}
    </div>
  );
}
