import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoutines, type Routine } from '../hooks/useRoutines'
import { startSession } from '../hooks/useSessions'
import { PlateSpinner } from '../components/PlateSpinner'
import { SkeletonList } from '../components/Skeleton'
import { PlayIcon, CheckIcon, XIcon } from '../components/Icon'
import { ConfirmButton } from '../components/ConfirmButton'
import { PLATE_COLORS as ACCENTS } from '../lib/plateColors'

export function RoutinesPage() {
  const { routines, exerciseCounts, loading, create, remove, rename, duplicate } = useRoutines()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [starting, setStarting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function addRoutine(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await create(name.trim())
    setName('')
  }

  async function start(routineId: string, routineName: string) {
    setStarting(routineId)
    try {
      const session = await startSession(routineId, routineName)
      navigate(`/sessions/${session.id}`)
    } finally {
      setStarting(null)
    }
  }

  function beginEdit(r: Routine) {
    setEditingId(r.id)
    setEditName(r.name)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim() || !editingId) return
    await rename(editingId, editName.trim())
    setEditingId(null)
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk-dim">Bitácora</p>
        <h1 className="font-display text-3xl uppercase leading-none tracking-wide">Mis rutinas</h1>
      </div>

      <form onSubmit={addRoutine} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nueva rutina (ej. Día A)"
          className="flex-1 rounded-lg border border-steel-3 bg-steel px-3.5 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 focus:border-plate-red focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-plate-red px-4 py-2.5 text-sm font-semibold text-chalk transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-steel-3 disabled:text-chalk-dim disabled:active:scale-100"
        >
          Crear
        </button>
      </form>

      {loading && <SkeletonList count={3} variant="card" />}

      {!loading && routines.length === 0 && (
        <div className="rounded-2xl border border-dashed border-steel-3 px-4 py-10 text-center">
          <p className="text-sm text-chalk-dim">
            Tu bitácora está vacía. Escribe un nombre arriba y toca "Crear" para cargar tu primera rutina.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {routines.map((r, i) => {
          const accent = ACCENTS[i % ACCENTS.length]
          const count = exerciseCounts[r.id] ?? 0
          const hasExercises = count > 0
          const isEditing = editingId === r.id
          return (
            <li
              key={r.id}
              className="animate-rise-in overflow-hidden rounded-xl border border-steel-3 bg-steel"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex">
                <span className={`w-1.5 shrink-0 ${accent}`} />
                <div className="flex-1 p-4">
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="flex gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 rounded-lg border border-plate-blue bg-ink px-3 py-1.5 text-sm text-chalk focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!editName.trim()}
                        aria-label="Guardar nombre"
                        className="rounded-lg bg-plate-blue px-3 text-chalk disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancelar"
                        className="rounded-lg border border-steel-3 px-3 text-chalk-dim"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/routines/${r.id}`)}
                        className="text-left font-display text-xl uppercase tracking-wide text-chalk"
                      >
                        {r.name}
                      </button>
                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          onClick={() => beginEdit(r)}
                          className="text-xs text-chalk-dim transition-colors hover:text-plate-blue"
                        >
                          Renombrar
                        </button>
                        <button
                          onClick={() => duplicate(r)}
                          className="text-xs text-chalk-dim transition-colors hover:text-plate-yellow"
                        >
                          Duplicar
                        </button>
                        <ConfirmButton
                          onConfirm={() => remove(r.id)}
                          className="text-xs text-chalk-dim transition-colors hover:text-plate-red"
                          armedClassName="text-xs font-semibold text-plate-red"
                        >
                          Eliminar
                        </ConfirmButton>
                      </div>
                    </div>
                  )}

                  <p className="mt-0.5 font-mono text-[11px] tabular-nums text-chalk-dim">
                    {count} {count === 1 ? 'ejercicio' : 'ejercicios'}
                  </p>

                  {hasExercises ? (
                    <button
                      onClick={() => start(r.id, r.name)}
                      disabled={starting === r.id}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-chalk transition-transform active:scale-[0.98] disabled:opacity-60"
                    >
                      {starting === r.id ? (
                        <PlateSpinner className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4 text-plate-green" />
                      )}
                      {starting === r.id ? 'Iniciando...' : 'Empezar entrenamiento'}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/routines/${r.id}`)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-steel-3 py-2.5 text-sm font-semibold text-chalk-dim transition-colors hover:border-plate-blue/50 hover:text-plate-blue"
                    >
                      + Agrega ejercicios para poder empezar
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
