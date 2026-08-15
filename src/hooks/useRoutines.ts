import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/db'
import { useToast } from './useToast'

export type Routine = Tables<'routines'>
export type RoutineExercise = Tables<'routine_exercises'>

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [exerciseCounts, setExerciseCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    const { data } = await supabase.from('routines').select('*').order('position')
    setRoutines(data ?? [])

    const ids = (data ?? []).map((r) => r.id)
    if (ids.length) {
      const { data: exRows } = await supabase.from('routine_exercises').select('routine_id').in('routine_id', ids)
      const counts: Record<string, number> = {}
      for (const row of exRows ?? []) counts[row.routine_id] = (counts[row.routine_id] ?? 0) + 1
      setExerciseCounts(counts)
    } else {
      setExerciseCounts({})
    }
    setLoading(false)
  }

  async function create(name: string) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    const { data, error } = await supabase
      .from('routines')
      .insert({ name, user_id: userData.user.id, position: routines.length })
      .select()
      .single()
    if (error || !data) {
      toast('No se pudo crear la rutina. Intenta de nuevo.')
      return
    }
    setRoutines((prev) => [...prev, data])
  }

  async function remove(id: string) {
    const removed = routines.find((r) => r.id === id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (error && removed) {
      setRoutines((prev) => [...prev, removed].sort((a, b) => a.position - b.position))
      toast('No se pudo eliminar la rutina. Revisa tu conexión.')
    }
  }

  async function rename(id: string, name: string) {
    const previous = routines.find((r) => r.id === id)?.name
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)))
    const { error } = await supabase.from('routines').update({ name }).eq('id', id)
    if (error && previous) {
      setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, name: previous } : r)))
      toast('No se pudo renombrar la rutina.')
    }
  }

  async function duplicate(routine: Routine) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    const { data: newRoutine, error } = await supabase
      .from('routines')
      .insert({ name: `${routine.name} (copia)`, user_id: userData.user.id, position: routines.length })
      .select()
      .single()
    if (error || !newRoutine) {
      toast('No se pudo duplicar la rutina.')
      return
    }
    setRoutines((prev) => [...prev, newRoutine])

    const { data: sourceExercises } = await supabase
      .from('routine_exercises')
      .select('*')
      .eq('routine_id', routine.id)
      .order('position')
    if (sourceExercises?.length) {
      const copies = sourceExercises.map((ex) => ({
        routine_id: newRoutine.id,
        name: ex.name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        position: ex.position,
      }))
      await supabase.from('routine_exercises').insert(copies)
      setExerciseCounts((prev) => ({ ...prev, [newRoutine.id]: copies.length }))
    }
  }

  return { routines, exerciseCounts, loading, create, remove, rename, duplicate, refresh }
}

export function useRoutineExercises(routineId: string) {
  const [exercises, setExercises] = useState<RoutineExercise[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    refresh()
  }, [routineId])

  async function refresh() {
    setLoading(true)
    const { data } = await supabase
      .from('routine_exercises')
      .select('*')
      .eq('routine_id', routineId)
      .order('position')
    setExercises(data ?? [])
    setLoading(false)
  }

  async function add(name: string, targetSets: number, targetReps: number) {
    const { data, error } = await supabase
      .from('routine_exercises')
      .insert({
        routine_id: routineId,
        name,
        target_sets: targetSets,
        target_reps: targetReps,
        position: exercises.length,
      })
      .select()
      .single()
    if (error || !data) {
      toast('No se pudo agregar el ejercicio.')
      return
    }
    setExercises((prev) => [...prev, data])
  }

  async function remove(id: string) {
    const removed = exercises.find((e) => e.id === id)
    setExercises((prev) => prev.filter((e) => e.id !== id))
    const { error } = await supabase.from('routine_exercises').delete().eq('id', id)
    if (error && removed) {
      setExercises((prev) => [...prev, removed].sort((a, b) => a.position - b.position))
      toast('No se pudo eliminar el ejercicio.')
    }
  }

  async function update(id: string, name: string, targetSets: number, targetReps: number) {
    const previous = exercises.find((e) => e.id === id)
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name, target_sets: targetSets, target_reps: targetReps } : e)),
    )
    const { error } = await supabase
      .from('routine_exercises')
      .update({ name, target_sets: targetSets, target_reps: targetReps })
      .eq('id', id)
    if (error && previous) {
      setExercises((prev) => prev.map((e) => (e.id === id ? previous : e)))
      toast('No se pudieron guardar los cambios.')
    }
  }

  async function move(id: string, direction: -1 | 1) {
    const index = exercises.findIndex((e) => e.id === id)
    const swapIndex = index + direction
    if (index < 0 || swapIndex < 0 || swapIndex >= exercises.length) return
    const a = exercises[index]
    const b = exercises[swapIndex]
    const next = [...exercises]
    next[index] = { ...b, position: a.position }
    next[swapIndex] = { ...a, position: b.position }
    setExercises(next)
    await supabase.from('routine_exercises').update({ position: b.position }).eq('id', a.id)
    await supabase.from('routine_exercises').update({ position: a.position }).eq('id', b.id)
  }

  return { exercises, loading, add, remove, update, move }
}

/** Distinct exercise names this user has already typed, for autocomplete when naming a new one. */
export function useExerciseSuggestions() {
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('routine_exercises')
      .select('name')
      .then(({ data }) => {
        setNames(Array.from(new Set((data ?? []).map((d) => d.name))).sort())
      })
  }, [])

  return names
}
