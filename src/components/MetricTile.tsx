export function MetricTile({
  label,
  value,
  accent = 'text-chalk',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-steel-3 bg-steel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">{label}</p>
      <p className={`mt-1 font-mono text-2xl tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}
