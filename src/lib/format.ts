export function formatDuration(ms: number) {
  const totalMin = Math.max(1, Math.round(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m} min`
}

export function formatVolume(kg: number) {
  return `${Math.round(kg).toLocaleString('es-PE')}kg`
}

/** Estimated one-rep max via the Epley formula. */
export function estimateOneRepMax(weight: number, reps: number) {
  return weight * (1 + reps / 30)
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
