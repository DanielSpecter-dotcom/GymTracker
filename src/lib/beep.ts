let audioCtx: AudioContext | null = null

/**
 * iOS never implements the Vibration API, so a rest-timer alert needs an audio
 * fallback there. Safari also refuses to start/resume an AudioContext outside
 * a user gesture, so this must be called synchronously from a click/tap handler
 * (before any `await`) — playBeep() itself can then fire later from a timer.
 */
export function unlockAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctx) audioCtx = new Ctx()
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume()
}

export function playBeep() {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.4)
}
