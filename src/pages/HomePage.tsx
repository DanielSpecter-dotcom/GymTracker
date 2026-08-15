import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWeekActivity } from '../hooks/useProgress'
import { useDashboard } from '../hooks/useDashboard'
import { startSession, useActiveSession } from '../hooks/useSessions'
import { WeekStrip } from '../components/WeekStrip'
import { MetricTile } from '../components/MetricTile'
import { PlateSpinner } from '../components/PlateSpinner'
import { PlayIcon } from '../components/Icon'
import { getGreeting, formatVolume } from '../lib/format'

function daysSinceMessage(days: number | null) {
  if (days === null) return 'Todavía no registraste ningún entrenamiento. ¡Arrancá hoy!'
  if (days === 0) return 'Ya entrenaste hoy. Bien ahí.'
  if (days === 1) return 'Entrenaste ayer.'
  return `Van ${days} días sin entrenar.`
}

export function HomePage() {
  const { session, signOut } = useAuth()
  const activeDates = useWeekActivity()
  const dashboard = useDashboard()
  const { active: activeSession } = useActiveSession()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)

  const name = session?.user.user_metadata?.full_name || session?.user.email?.split('@')[0] || ''
  const volumeDelta = dashboard.weekVolume - dashboard.lastWeekVolume

  async function continueRoutine() {
    if (!dashboard.lastRoutine) return
    setStarting(true)
    try {
      const s = await startSession(dashboard.lastRoutine.id, dashboard.lastRoutine.name)
      navigate(`/sessions/${s.id}`)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">{getGreeting()}</p>
          <h1 className="font-display text-3xl uppercase leading-none tracking-wide">{name || 'Bienvenido'}</h1>
        </div>
        <button
          onClick={signOut}
          className="rounded-lg border border-steel-3 px-3 py-1.5 text-xs text-chalk-dim transition-colors hover:border-plate-red/50 hover:text-plate-red"
        >
          Salir
        </button>
      </div>

      <WeekStrip activeDates={activeDates} />

      {dashboard.loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-chalk-dim">
          <PlateSpinner className="h-4 w-4" /> Cargando...
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-steel-3 bg-steel p-4">
            <p className="text-sm text-chalk">{daysSinceMessage(dashboard.daysSinceLast)}</p>
          </div>

          {activeSession ? (
            <button
              onClick={() => navigate(`/sessions/${activeSession.id}`)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-plate-yellow py-3.5 font-display text-lg uppercase tracking-wide text-ink transition-transform active:scale-[0.98]"
            >
              <PlayIcon className="h-4 w-4" />
              Reanudar {activeSession.routineName}
            </button>
          ) : (
            dashboard.lastRoutine && (
              <button
                onClick={continueRoutine}
                disabled={starting}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-plate-red py-3.5 font-display text-lg uppercase tracking-wide text-chalk transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {starting ? <PlateSpinner className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                Continuar con {dashboard.lastRoutine.name}
              </button>
            )
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <MetricTile label="Volumen esta semana" value={formatVolume(dashboard.weekVolume)} />
            <MetricTile label="Entrenos este mes" value={String(dashboard.monthCount)} accent="text-plate-blue" />
          </div>

          {dashboard.lastWeekVolume > 0 && (
            <p className="mb-4 -mt-2 px-1 font-mono text-xs text-chalk-dim">
              <span className={volumeDelta >= 0 ? 'text-plate-green' : 'text-plate-red'}>
                {volumeDelta >= 0 ? '▲' : '▼'} {formatVolume(Math.abs(volumeDelta))}
              </span>{' '}
              vs. la semana pasada
            </p>
          )}

          <div className="rounded-xl border border-steel-3 bg-steel p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">Último PR</p>
            {dashboard.lastPR ? (
              <p className="mt-1 text-chalk">
                <span className="font-medium">{dashboard.lastPR.exerciseName}</span>{' '}
                <span className="font-mono tabular-nums text-plate-yellow">
                  {dashboard.lastPR.weight}kg × {dashboard.lastPR.reps}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-chalk-dim">Todavía no hay marcas registradas.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
