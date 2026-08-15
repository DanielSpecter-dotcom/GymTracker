import { useState } from 'react'
import type { LastPerformance, SessionSet } from '../hooks/useSessions'
import { PlateStack } from './PlateStack'
import { XIcon } from './Icon'

export function ExerciseSetRow({
  exerciseName,
  targetSets,
  targetReps,
  sets,
  lastPerformance,
  onAddSet,
  onRemoveSet,
}: {
  exerciseName: string
  targetSets: number
  targetReps: number
  sets: SessionSet[]
  lastPerformance?: LastPerformance
  onAddSet: (weight: number, reps: number) => void
  onRemoveSet: (id: string) => void
}) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (Number.isNaN(w) || Number.isNaN(r)) return
    onAddSet(w, r)
    setWeight('')
    setReps('')
  }

  return (
    <div className="mb-3 rounded-xl border border-steel-3 bg-steel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg uppercase leading-none tracking-wide text-chalk">
          {exerciseName}
        </h3>
        <span className="font-mono text-[11px] tabular-nums text-chalk-dim">
          objetivo {targetSets}×{targetReps}
        </span>
      </div>

      <PlateStack target={targetSets} filled={sets.length} />

      {lastPerformance && (
        <p className="mt-2 font-mono text-[11px] tabular-nums text-chalk-dim">
          última vez <span className="text-chalk">{lastPerformance.weight}kg × {lastPerformance.reps}</span>
        </p>
      )}

      {sets.length > 0 && (
        <ul className="mt-3 divide-y divide-dashed divide-steel-3/80 border-t border-dashed border-steel-3/80">
          {sets.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-1.5 text-sm">
              <span className="font-mono tabular-nums text-chalk-dim">
                <span className="text-chalk-dim/60">S{s.set_number}</span>{' '}
                <span className="text-chalk">{s.weight}kg</span>
                <span className="text-chalk-dim"> × {s.reps}</span>
              </span>
              <button
                onClick={() => onRemoveSet(s.id)}
                className="px-2 text-chalk-dim transition-colors hover:text-plate-red"
                aria-label="Quitar serie"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder={lastPerformance ? String(lastPerformance.weight) : 'kg'}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 rounded-lg border border-steel-3 bg-ink px-2 py-2.5 text-center font-mono text-sm tabular-nums text-chalk focus:border-plate-red focus:outline-none"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder={lastPerformance ? String(lastPerformance.reps) : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-20 rounded-lg border border-steel-3 bg-ink px-2 py-2.5 text-center font-mono text-sm tabular-nums text-chalk focus:border-plate-red focus:outline-none"
        />
        <button
          type="submit"
          disabled={!weight.trim() || !reps.trim()}
          className="flex-1 rounded-lg bg-plate-red text-sm font-semibold text-chalk transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-steel-3 disabled:text-chalk-dim disabled:active:scale-100"
        >
          + Serie
        </button>
      </form>
    </div>
  )
}
