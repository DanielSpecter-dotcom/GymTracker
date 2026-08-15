import { useEffect, useRef, useState } from 'react'

export const REST_PRESETS = [60, 90, 120] as const
const STORAGE_KEY = 'gymtracker:rest-duration'

export function useRestTimer() {
  const [duration, setDuration] = useState<number>(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    return (REST_PRESETS as readonly number[]).includes(saved) ? saved : 90
  })
  const [remaining, setRemaining] = useState(0)
  const endAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => {
      const left = endAtRef.current ? Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000)) : 0
      setRemaining(left)
      if (left <= 0) {
        clearInterval(id)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining > 0])

  function start() {
    endAtRef.current = Date.now() + duration * 1000
    setRemaining(duration)
  }

  function skip() {
    endAtRef.current = null
    setRemaining(0)
  }

  function extend(seconds: number) {
    if (!endAtRef.current) return
    endAtRef.current += seconds * 1000
    setRemaining((r) => r + seconds)
  }

  function changeDuration(d: number) {
    setDuration(d)
    localStorage.setItem(STORAGE_KEY, String(d))
  }

  return { duration, remaining, start, skip, extend, changeDuration }
}
