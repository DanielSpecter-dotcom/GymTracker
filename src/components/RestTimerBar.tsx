import { REST_PRESETS } from '../hooks/useRestTimer'

export function RestTimerBar({
  duration,
  remaining,
  skip,
  extend,
  changeDuration,
}: {
  duration: number
  remaining: number
  skip: () => void
  extend: (seconds: number) => void
  changeDuration: (d: number) => void
}) {
  if (remaining <= 0) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-steel-3 bg-steel px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">Descanso</span>
        <div className="flex gap-1.5">
          {REST_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => changeDuration(d)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors ${
                duration === d ? 'bg-plate-yellow text-ink' : 'bg-ink text-chalk-dim'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>
    )
  }

  const mm = Math.floor(remaining / 60)
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-10 mx-auto flex max-w-md items-center justify-between gap-3 border-t border-plate-yellow/30 bg-steel/95 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse-ring rounded-full bg-plate-yellow" />
        <span className="font-mono text-lg tabular-nums text-plate-yellow">
          {mm}:{ss}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">descanso</span>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => extend(15)}
          className="rounded-md border border-steel-3 px-2 py-1 font-mono text-xs text-chalk-dim transition-colors hover:text-chalk"
        >
          +15s
        </button>
        <button
          onClick={skip}
          className="rounded-md border border-steel-3 px-2 py-1 font-mono text-xs text-chalk-dim transition-colors hover:text-plate-red"
        >
          Saltar
        </button>
      </div>
    </div>
  )
}
