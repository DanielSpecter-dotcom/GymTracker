import { PLATE_COLORS as ACCENTS } from '../lib/plateColors'

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function WeekStrip({ activeDates }: { activeDates: Set<string> }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  return (
    <div className="mb-5 flex justify-between rounded-xl border border-steel-3 bg-steel px-3 py-3">
      {days.map((d, i) => {
        const active = activeDates.has(d.toDateString())
        const isToday = i === 6
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wide text-chalk-dim">
              {DAY_LABELS[d.getDay()]}
            </span>
            <span
              className={`h-6 w-6 rounded-full border-2 transition-colors ${
                active ? `${ACCENTS[i % ACCENTS.length]} border-transparent` : 'border-steel-3'
              } ${isToday ? 'outline outline-1 outline-offset-2 outline-chalk-dim/40' : ''}`}
              aria-label={active ? 'Entrenaste este día' : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}
