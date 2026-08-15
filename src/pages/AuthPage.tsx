import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PlateSpinner } from '../components/PlateSpinner'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmSent, setConfirmSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setConfirmSent(false)
    setBusy(true)
    try {
      if (mode === 'login') await signIn(email, password)
      else {
        await signUp(email, password, name.trim())
        setConfirmSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col justify-center px-6">
      <div className="animate-rise-in mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-baseline gap-2">
          <span className="h-8 w-1.5 rounded-full bg-plate-red" />
          <div>
            <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-chalk">
              Gym<span className="text-plate-red">Tracker</span>
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-chalk-dim">
              {mode === 'login' ? 'Iniciar sesión' : 'Nueva cuenta'}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-steel-3 bg-steel p-5">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">
                Nombre
              </span>
              <input
                type="text"
                required
                autoComplete="given-name"
                placeholder="Cómo te llamamos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-steel-3 bg-ink px-3.5 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-plate-red focus:outline-none"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-steel-3 bg-ink px-3.5 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-plate-red focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-chalk-dim">
              Contraseña
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-steel-3 bg-ink px-3.5 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-plate-red focus:outline-none"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-plate-red/30 bg-plate-red/10 px-3 py-2 text-sm text-plate-red">
              {error}
            </p>
          )}
          {confirmSent && (
            <p className="rounded-lg border border-plate-green/30 bg-plate-green/10 px-3 py-2 text-sm text-plate-green">
              Revisa tu correo para confirmar la cuenta.
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-plate-red py-3.5 font-display text-lg uppercase tracking-wide text-chalk transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busy && <PlateSpinner className="h-4 w-4" />}
            {mode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setConfirmSent(false)
          }}
          className="mt-5 w-full text-center text-sm text-chalk-dim transition-colors hover:text-chalk"
        >
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span className="text-plate-blue">
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </span>
        </button>
      </div>
    </div>
  )
}
