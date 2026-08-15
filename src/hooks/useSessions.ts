import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/db'
import type { RoutineExercise } from './useRoutines'
import { useToast } from './useToast'

export type WorkoutSession = Tables<'workout_sessions'>
export type SessionSet = Tables<'session_sets'>

export async function startSession(routineId: string, routineName: string) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not signed in')
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userData.user.id,
      routine_id: routineId,
      routine_name_snapshot: routineName,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export type ActiveSession = { id: string; routineName: string }

/** The user's in-progress (not yet finished) session, if any — there's at most one at a time. */
export async function findActiveSession(): Promise<ActiveSession | null> {
  const { data } = await supabase
    .from('workout_sessions')
    .select('id, routine_name_snapshot')
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ? { id: data.id, routineName: data.routine_name_snapshot } : null
}

export function useActiveSession() {
  const [active, setActive] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    findActiveSession().then((a) => {
      setActive(a)
      setLoading(false)
    })
  }, [])

  return { active, loading }
}

/** Total volume (kg × reps) of the most recent previous completed session for this routine, if any. */
export async function fetchPreviousSessionVolume(routineId: string, excludeSessionId: string) {
  const { data: prevSession } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('routine_id', routineId)
    .not('completed_at', 'is', null)
    .neq('id', excludeSessionId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!prevSession) return null
  const { data: sets } = await supabase.from('session_sets').select('weight, reps').eq('session_id', prevSession.id)
  if (!sets?.length) return null
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

export function useSession(sessionId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([])
  const [sets, setSets] = useState<SessionSet[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    refresh()
  }, [sessionId])

  async function refresh() {
    setLoading(true)
    const { data: sessionData } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    setSession(sessionData)

    if (sessionData?.routine_id) {
      const { data: exercises } = await supabase
        .from('routine_exercises')
        .select('*')
        .eq('routine_id', sessionData.routine_id)
        .order('position')
      setRoutineExercises(exercises ?? [])
    }

    const { data: setsData } = await supabase
      .from('session_sets')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at')
    setSets(setsData ?? [])
    setLoading(false)
  }

  async function addSet(exerciseName: string, weight: number, reps: number) {
    const setNumber = sets.filter((s) => s.exercise_name === exerciseName).length + 1
    const { data, error } = await supabase
      .from('session_sets')
      .insert({
        session_id: sessionId,
        exercise_name: exerciseName,
        set_number: setNumber,
        weight,
        reps,
      })
      .select()
      .single()
    if (error || !data) {
      toast('No se pudo registrar la serie. Revisa tu conexión.')
      return
    }
    setSets((prev) => [...prev, data])
  }

  async function removeSet(id: string) {
    const removed = sets.find((s) => s.id === id)
    setSets((prev) => prev.filter((s) => s.id !== id))
    const { error } = await supabase.from('session_sets').delete().eq('id', id)
    if (error && removed) {
      setSets((prev) => [...prev, removed])
      toast('No se pudo quitar la serie.')
    }
  }

  async function finish() {
    const { error } = await supabase
      .from('workout_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (error) {
      toast('No se pudo finalizar el entrenamiento. Intenta de nuevo.')
      return false
    }
    await refresh()
    return true
  }

  async function cancel() {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
    if (error) {
      toast('No se pudo cancelar el entrenamiento.')
      return false
    }
    return true
  }

  return { session, routineExercises, sets, loading, addSet, removeSet, finish, cancel }
}

export type LastPerformance = { weight: number; reps: number }

/** Most recent logged set per exercise, from any previous session — powers the "última vez" hint. */
export function useLastPerformance(exerciseNames: string[], excludeSessionId: string) {
  const [lastByExercise, setLastByExercise] = useState<Record<string, LastPerformance>>({})
  const key = exerciseNames.join('|')

  useEffect(() => {
    if (!key) return
    supabase
      .from('session_sets')
      .select('exercise_name, weight, reps, created_at')
      .in('exercise_name', key.split('|'))
      .neq('session_id', excludeSessionId)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const map: Record<string, LastPerformance> = {}
        for (const row of data ?? []) {
          if (!map[row.exercise_name]) map[row.exercise_name] = { weight: row.weight, reps: row.reps }
        }
        setLastByExercise(map)
      })
  }, [key, excludeSessionId])

  return lastByExercise
}
