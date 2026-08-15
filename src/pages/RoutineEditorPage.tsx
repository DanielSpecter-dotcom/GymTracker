import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRoutineExercises, useExerciseSuggestions, type RoutineExercise } from '../hooks/useRoutines'
import { SkeletonList } from '../components/Skeleton'
import { ConfirmButton } from '../components/ConfirmButton'
import { ChevronUpIcon, ChevronDownIcon, XIcon } from '../components/Icon'

export function RoutineEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exercises, loading, add, remove, update, move } = useRoutineExercises(id!)
  const suggestions = useExerciseSuggestions()
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [editingId, setEditingId] = useState<string | null>(null)

  function startEdit(ex: RoutineExercise) {
    setEditingId(ex.id)
    setName(ex.name)
    setSets(String(ex.target_sets))
    setReps(String(ex.target_reps))
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setSets('3')
    setReps('10')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (editingId) {
      await update(editingId, name.trim(), parseInt(sets, 10) || 3, parseInt(reps, 10) || 10)
      cancelEdit()
    } else {
      await add(name.trim(), parseInt(sets, 10) || 3, parseInt(reps, 10) || 10)
      setName('')
    }
  }

  return (
    <div className="px-4 pt-6">
      <button
        onClick={() => navigate('/routines')}
        className="mb-4 text-sm text-chalk-dim transition-colors hover:text-chalk"
      >
        ← Rutinas
      </button>
      <h1 className="mb-4 font-display text-3xl uppercase leading-none tracking-wide">
        Editar ejercicios
      </h1>

      <form onSubmit={submit} className="mb-5 space-y-2.5 rounded-xl border border-steel-3 bg-steel p-4">
        {editingId && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-plate-blue">Editando ejercicio</p>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del ejercicio"
          list="exercise-suggestions"
          className="w-full rounded-lg border border-steel-3 bg-ink px-3 py-2.5 text-sm text-chalk placeholder:text-chalk-dim/60 focus:border-plate-red focus:outline-none"
        />
        <datalist id="exercise-suggestions">
          {suggestions.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">
              Series
            </span>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              className="w-full rounded-lg border border-steel-3 bg-ink px-3 py-2.5 text-sm tabular-nums text-chalk font-mono focus:border-plate-red focus:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">
              Reps
            </span>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full rounded-lg border border-steel-3 bg-ink px-3 py-2.5 text-sm tabular-nums text-chalk font-mono focus:border-plate-red focus:outline-none"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 rounded-lg bg-plate-red py-2.5 text-sm font-semibold text-chalk transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-steel-3 disabled:text-chalk-dim disabled:active:scale-100"
          >
            {editingId ? 'Guardar cambios' : '+ Agregar ejercicio'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-steel-3 px-4 text-sm text-chalk-dim"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <SkeletonList count={4} variant="row" />}

      {!loading && exercises.length === 0 && (
        <div className="rounded-2xl border border-dashed border-steel-3 px-4 py-8 text-center">
          <p className="text-sm text-chalk-dim">Todavía no hay ejercicios en esta rutina.</p>
        </div>
      )}

      <ul className="space-y-2">
        {exercises.map((ex, i) => (
          <li
            key={ex.id}
            className="animate-rise-in flex items-center justify-between rounded-xl border border-steel-3 bg-steel p-3.5"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <button onClick={() => startEdit(ex)} className="text-left">
              <p className="font-medium text-chalk">{ex.name}</p>
              <p className="font-mono text-xs tabular-nums text-chalk-dim">
                {ex.target_sets} × {ex.target_reps}
              </p>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(ex.id, -1)}
                disabled={i === 0}
                className="rounded-md border border-steel-3 px-2 py-1.5 text-chalk-dim transition-colors hover:text-chalk disabled:opacity-30"
                aria-label="Mover arriba"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => move(ex.id, 1)}
                disabled={i === exercises.length - 1}
                className="rounded-md border border-steel-3 px-2 py-1.5 text-chalk-dim transition-colors hover:text-chalk disabled:opacity-30"
                aria-label="Mover abajo"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              <ConfirmButton
                onConfirm={() => remove(ex.id)}
                className="rounded-md border border-steel-3 px-2 py-1.5 text-chalk-dim transition-colors hover:border-plate-red/50 hover:text-plate-red"
                armedClassName="rounded-md border border-plate-red bg-plate-red/10 px-2 py-1 text-xs font-semibold text-plate-red"
                confirmLabel="¿Seguro?"
              >
                <XIcon className="h-4 w-4" />
              </ConfirmButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
