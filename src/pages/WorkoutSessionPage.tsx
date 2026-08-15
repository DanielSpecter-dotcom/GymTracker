import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSession, useLastPerformance, fetchPreviousSessionVolume } from '../hooks/useSessions'
import { useRestTimer } from '../hooks/useRestTimer'
import { ExerciseSetRow } from '../components/ExerciseSetRow'
import { PlateSpinner } from '../components/PlateSpinner'
import { RestTimerBar } from '../components/RestTimerBar'
import { SkeletonList } from '../components/Skeleton'
import { MetricTile } from '../components/MetricTile'
import { ConfirmButton } from '../components/ConfirmButton'
import { CheckIcon } from '../components/Icon'
import { formatDuration, formatVolume } from '../lib/format'

type Summary = { totalVolume: number; durationMs: number; prevVolume: number | null }

const DUST_DOTS = [
  { x: -18, y: -10, d: '0ms', c: 'bg-chalk' },
  { x: 14, y: -18, d: '40ms', c: 'bg-plate-yellow' },
  { x: 22, y: 6, d: '80ms', c: 'bg-chalk' },
  { x: -6, y: 20, d: '60ms', c: 'bg-plate-red' },
  { x: -24, y: 8, d: '20ms', c: 'bg-chalk' },
]

export function WorkoutSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, routineExercises, sets, loading, addSet, removeSet, finish, cancel } = useSession(id!)
  const lastByExercise = useLastPerformance(
    routineExercises.map((e) => e.name),
    id!,
  )
  const rest = useRestTimer()
  const [finishing, setFinishing] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)

  async function logSet(exerciseName: string, weight: number, reps: number) {
    await addSet(exerciseName, weight, reps)
    rest.start()
  }

  async function finishWorkout() {
    setFinishing(true)
    const completedAt = new Date()
    const ok = await finish()
    if (!ok || !session) {
      setFinishing(false)
      return
    }
    const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    const durationMs = completedAt.getTime() - new Date(session.started_at).getTime()
    const prevVolume = session.routine_id
      ? await fetchPreviousSessionVolume(session.routine_id, session.id)
      : null
    setFinishing(false)
    setSummary({ totalVolume, durationMs, prevVolume })
  }

  async function cancelWorkout() {
    const ok = await cancel()
    if (ok) navigate('/')
  }

  if (loading || !session) {
    return (
      <div className="px-4 pt-6">
        <SkeletonList count={3} variant="card" />
      </div>
    )
  }

  if (summary) {
    const delta = summary.prevVolume !== null ? summary.totalVolume - summary.prevVolume : null
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="pointer-events-none absolute inset-0" aria-hidden="true">
          {DUST_DOTS.map((dot, i) => (
            <span
              key={i}
              className={`absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${dot.c} animate-dust-pop`}
              style={{ marginLeft: dot.x, marginTop: dot.y, animationDelay: dot.d }}
            />
          ))}
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-plate-green">Entrenamiento completo</p>
        <h1 className="font-display text-4xl uppercase leading-none tracking-wide">
          {session.routine_name_snapshot}
        </h1>

        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <MetricTile label="Volumen" value={formatVolume(summary.totalVolume)} />
          <MetricTile label="Duración" value={formatDuration(summary.durationMs)} />
        </div>

        {delta !== null && (
          <p className="font-mono text-sm text-chalk-dim">
            <span className={delta >= 0 ? 'text-plate-green' : 'text-plate-red'}>
              {delta >= 0 ? '▲' : '▼'} {formatVolume(Math.abs(delta))}
            </span>{' '}
            vs. la vez anterior
          </p>
        )}

        <button
          onClick={() => navigate('/history')}
          className="w-full max-w-xs rounded-xl bg-plate-red py-3.5 font-display text-lg uppercase tracking-wide text-chalk transition-transform active:scale-[0.98]"
        >
          Ver historial
        </button>
      </div>
    )
  }

  const totalSets = sets.length
  const totalTarget = routineExercises.reduce((sum, ex) => sum + ex.target_sets, 0)

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">
          {session.completed_at ? 'Sesión finalizada' : 'Entrenamiento en curso'}
        </p>
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-3xl uppercase leading-none tracking-wide">
            {session.routine_name_snapshot}
          </h1>
          <span className="font-mono text-sm tabular-nums text-chalk-dim">
            {totalSets}/{totalTarget || totalSets} series
          </span>
        </div>
      </div>

      {!session.completed_at && <RestTimerBar {...rest} />}

      {routineExercises.length === 0 && (
        <div className="mb-4 rounded-2xl border border-dashed border-steel-3 px-4 py-8 text-center">
          <p className="text-sm text-chalk-dim">
            Esta rutina no tiene ejercicios cargados, así que no hay nada para registrar aquí.
            Finaliza esta sesión y agrega ejercicios desde "Mis rutinas".
          </p>
        </div>
      )}

      {routineExercises.map((ex, i) => (
        <div key={ex.id} className="animate-rise-in" style={{ animationDelay: `${i * 60}ms` }}>
          <ExerciseSetRow
            exerciseName={ex.name}
            targetSets={ex.target_sets}
            targetReps={ex.target_reps}
            sets={sets.filter((s) => s.exercise_name === ex.name)}
            lastPerformance={lastByExercise[ex.name]}
            onAddSet={(weight, reps) => logSet(ex.name, weight, reps)}
            onRemoveSet={removeSet}
          />
        </div>
      ))}

      {!session.completed_at && (
        <div className="mb-24 mt-2 space-y-3">
          <button
            onClick={finishWorkout}
            disabled={finishing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-plate-green py-3.5 font-display text-lg uppercase tracking-wide text-ink transition-transform active:scale-[0.98] disabled:opacity-80"
          >
            {finishing ? <PlateSpinner className="h-4 w-4 text-ink" /> : <CheckIcon className="h-5 w-5" />} Finalizar
            entrenamiento
          </button>
          <ConfirmButton
            onConfirm={cancelWorkout}
            className="w-full text-center text-xs text-chalk-dim transition-colors hover:text-plate-red"
            armedClassName="w-full text-center text-xs font-semibold text-plate-red"
            confirmLabel="¿Seguro? Se borra todo lo registrado — toca para confirmar"
          >
            Cancelar entrenamiento
          </ConfirmButton>
        </div>
      )}
    </div>
  )
}
