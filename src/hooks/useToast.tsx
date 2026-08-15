import { createContext, useCallback, useContext, useRef, useState } from 'react'

type Tone = 'error' | 'success'
type Toast = { id: number; message: string; tone: Tone }

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const show = useCallback((message: string, tone: Tone = 'error') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-rise-in pointer-events-auto rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
              t.tone === 'error'
                ? 'border-plate-red/40 bg-steel text-plate-red'
                : 'border-plate-green/40 bg-steel text-plate-green'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast must be used within ToastProvider')
  return show
}
