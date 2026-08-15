import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkoutSession, SessionSet } from './useSessions'
import { useToast } from './useToast'
import { estimateOneRepMax } from '../lib/format'

export function useCompletedSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    supabase
      .from('workout_sessions')
      .select('*')
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: false })
      .then(({ data }) => {
        setSessions(data ?? [])
        setLoading(false)
      })
  }, [])

  async function remove(id: string) {
    const removed = sessions.find((s) => s.id === id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
    if (error && removed) {
      setSessions((prev) => [...prev, removed].sort((a, b) => b.started_at.localeCompare(a.started_at)))
      toast('No se pudo eliminar la sesión.')
    }
  }

  return { sessions, loading, remove }
}

export function useExerciseNames(refreshKey = 0) {
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('session_sets')
      .select('exercise_name')
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((d) => d.exercise_name))).sort()
        setNames(unique)
      })
  }, [refreshKey])

  return names
}

/** Dates (as toDateString()) with at least one completed session in the last 7 days — powers the week strip. */
export function useWeekActivity() {
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const since = new Date()
    since.setDate(since.getDate() - 6)
    since.setHours(0, 0, 0, 0)
    supabase
      .from('workout_sessions')
      .select('started_at')
      .not('completed_at', 'is', null)
      .gte('started_at', since.toISOString())
      .then(({ data }) => {
        setActiveDates(new Set((data ?? []).map((d) => new Date(d.started_at).toDateString())))
      })
  }, [])

  return activeDates
}

export type ProgressPoint = {
  date: string
  maxWeight: number
  volume: number
  oneRM: number
}

export function useExerciseProgress(exerciseName: string | null, refreshKey = 0) {
  const [points, setPoints] = useState<ProgressPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseName) {
      setPoints([])
      return
    }
    setLoading(true)
    ;(async () => {
      const { data: sets } = await supabase
        .from('session_sets')
        .select('weight, reps, session_id')
        .eq('exercise_name', exerciseName)
      const sessionIds = Array.from(new Set((sets ?? []).map((s) => s.session_id)))
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .in('id', sessionIds.length ? sessionIds : [''])

      const sessionDate = new Map((sessions ?? []).map((s) => [s.id, s.started_at]))
      const bySession = new Map<string, SessionSet[]>()
      for (const s of sets ?? []) {
        const list = bySession.get(s.session_id) ?? []
        list.push(s as SessionSet)
        bySession.set(s.session_id, list)
      }

      const result: ProgressPoint[] = Array.from(bySession.entries())
        .map(([sessionId, rows]) => ({
          date: sessionDate.get(sessionId) ?? '',
          maxWeight: Math.max(...rows.map((r) => r.weight)),
          volume: rows.reduce((sum, r) => sum + r.weight * r.reps, 0),
          oneRM: Math.max(...rows.map((r) => estimateOneRepMax(r.weight, r.reps))),
        }))
        .filter((p) => p.date)
        .sort((a, b) => a.date.localeCompare(b.date))

      setPoints(result)
      setLoading(false)
    })()
  }, [exerciseName, refreshKey])

  return { points, loading }
}
