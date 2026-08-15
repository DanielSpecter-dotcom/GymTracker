import { useState } from 'react'
import { useCompletedSessions, useExerciseNames, useExerciseProgress } from '../hooks/useProgress'
import { ProgressChart, type Metric } from '../components/ProgressChart'
import { SkeletonList } from '../components/Skeleton'
import { ConfirmButton } from '../components/ConfirmButton'

const METRIC_TABS: { key: Metric; label: string; activeClass: string }[] = [
  { key: 'maxWeight', label: 'Peso máximo', activeClass: 'bg-plate-red text-chalk' },
  { key: 'oneRM', label: '1RM estimado', activeClass: 'bg-plate-green text-ink' },
  { key: 'volume', label: 'Volumen', activeClass: 'bg-plate-blue text-chalk' },
]

export function HistoryPage() {
  const { sessions, loading, remove } = useCompletedSessions()
  const [refreshKey, setRefreshKey] = useState(0)
  const exerciseNames = useExerciseNames(refreshKey)
  const [selected, setSelected] = useState<string | null>(null)
  const [metric, setMetric] = useState<Metric>('maxWeight')
  const { points } = useExerciseProgress(selected, refreshKey)

  function removeSession(id: string) {
    remove(id)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">Evolución</p>
      <h1 className="mb-4 font-display text-3xl uppercase leading-none tracking-wide">Progreso</h1>

      {exerciseNames.length > 0 && (
        <div className="animate-rise-in mb-6 rounded-xl border border-steel-3 bg-steel p-4">
          <select
            value={selected ?? ''}
            onChange={(e) => setSelected(e.target.value || null)}
            className="mb-3 w-full rounded-lg border border-steel-3 bg-ink px-3 py-2.5 text-sm text-chalk focus:border-plate-red focus:outline-none"
          >
            <option value="">Elige un ejercicio</option>
            {exerciseNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {selected && (
            <>
              <div className="mb-3 flex gap-2">
                {METRIC_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMetric(tab.key)}
                    className={`flex-1 rounded-lg py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                      metric === tab.key ? tab.activeClass : 'bg-ink text-chalk-dim'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <ProgressChart points={points} metric={metric} />
            </>
          )}
        </div>
      )}

      <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.15em] text-chalk-dim">
        Sesiones registradas
      </h2>
      {loading && <SkeletonList count={3} variant="row" />}
      {!loading && sessions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-steel-3 px-4 py-8 text-center">
          <p className="text-sm text-chalk-dim">Todavía no completaste ninguna sesión.</p>
        </div>
      )}
      <ul className="space-y-2">
        {sessions.map((s, i) => (
          <li
            key={s.id}
            className="animate-rise-in flex items-center justify-between rounded-xl border border-steel-3 bg-steel p-3.5"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div>
              <p className="font-medium text-chalk">{s.routine_name_snapshot}</p>
              <p className="font-mono text-xs tabular-nums text-chalk-dim">
                {new Date(s.started_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <ConfirmButton
              onConfirm={() => removeSession(s.id)}
              className="shrink-0 text-xs text-chalk-dim transition-colors hover:text-plate-red"
              armedClassName="shrink-0 text-xs font-semibold text-plate-red"
              confirmLabel="¿Seguro?"
            >
              Eliminar
            </ConfirmButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
