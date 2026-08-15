import { useRef, useState } from 'react'

/** Requires a second tap within 3s before firing onConfirm — guards destructive actions without a modal. */
export function ConfirmButton({
  onConfirm,
  className,
  armedClassName,
  confirmLabel = '¿Seguro? Confirmar',
  children,
}: {
  onConfirm: () => void
  className: string
  armedClassName: string
  confirmLabel?: string
  children: React.ReactNode
}) {
  const [armed, setArmed] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleClick() {
    if (armed) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setArmed(false)
      onConfirm()
      return
    }
    setArmed(true)
    timeoutRef.current = setTimeout(() => setArmed(false), 3000)
  }

  return (
    <button onClick={handleClick} className={armed ? armedClassName : className}>
      {armed ? confirmLabel : children}
    </button>
  )
}
