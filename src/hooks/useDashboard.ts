import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { estimateOneRepMax } from '../lib/format'

export type LastPR = {
  exerciseName: string
  weight: number
  reps: number
  createdAt: string
}

export type Dashboard = {
  lastRoutine: { id: string; name: string } | null
  daysSinceLast: number | null
  weekVolume: number
  lastWeekVolume: number
  lastPR: LastPR | null
  monthCount: number
}

const EMPTY: Dashboard = {
  lastRoutine: null,
  daysSinceLast: null,
  weekVolume: 0,
  lastWeekVolume: 0,
  lastPR: null,
  monthCount: 0,
}

export function useDashboard() {
  const [data, setData] = useState<Dashboard>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const now = new Date()

      const { data: last } = await supabase
        .from('workout_sessions')
        .select('routine_id, routine_name_snapshot, started_at')
        .not('completed_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const lastRoutine = last?.routine_id
        ? { id: last.routine_id, name: last.routine_name_snapshot }
        : null
      const daysSinceLast = last
        ? Math.floor((now.getTime() - new Date(last.started_at).getTime()) / 86400000)
        : null

      const startThisWeek = new Date(now)
      startThisWeek.setDate(now.getDate() - 6)
      startThisWeek.setHours(0, 0, 0, 0)
      const startLastWeek = new Date(startThisWeek)
      startLastWeek.setDate(startThisWeek.getDate() - 7)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const { data: recentSessions } = await supabase
        .from('workout_sessions')
        .select('id, started_at')
        .not('completed_at', 'is', null)
        .gte('started_at', startLastWeek.toISOString())

      const thisWeekIds = new Set(
        (recentSessions ?? []).filter((s) => new Date(s.started_at) >= startThisWeek).map((s) => s.id),
      )
      const lastWeekIds = new Set(
        (recentSessions ?? [])
          .filter((s) => new Date(s.started_at) < startThisWeek)
          .map((s) => s.id),
      )
      const weekSessionIds = [...thisWeekIds, ...lastWeekIds]

      let weekVolume = 0
      let lastWeekVolume = 0
      if (weekSessionIds.length) {
        const { data: weekSets } = await supabase
          .from('session_sets')
          .select('session_id, weight, reps')
          .in('session_id', weekSessionIds)
        for (const s of weekSets ?? []) {
          const vol = s.weight * s.reps
          if (thisWeekIds.has(s.session_id)) weekVolume += vol
          else lastWeekVolume += vol
        }
      }

      const { count: monthCount } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .not('completed_at', 'is', null)
        .gte('started_at', startOfMonth.toISOString())

      const { data: allSets } = await supabase
        .from('session_sets')
        .select('exercise_name, weight, reps, created_at')
        .order('created_at', { ascending: true })

      const bestByExercise = new Map<string, number>()
      let lastPR: LastPR | null = null
      for (const s of allSets ?? []) {
        const oneRM = estimateOneRepMax(s.weight, s.reps)
        const best = bestByExercise.get(s.exercise_name) ?? 0
        if (oneRM > best) {
          bestByExercise.set(s.exercise_name, oneRM)
          lastPR = { exerciseName: s.exercise_name, weight: s.weight, reps: s.reps, createdAt: s.created_at }
        }
      }

      setData({ lastRoutine, daysSinceLast, weekVolume, lastWeekVolume, lastPR, monthCount: monthCount ?? 0 })
      setLoading(false)
    })()
  }, [])

  return { ...data, loading }
}
