import { PLATE_COLORS } from '../lib/plateColors'

export function PlateStack({ target, filled }: { target: number; filled: number }) {
  const count = Math.max(target, filled)
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const isFilled = i < filled
        const color = PLATE_COLORS[i % PLATE_COLORS.length]
        return (
          <span
            key={i}
            className={
              isFilled
                ? `h-3.5 w-3.5 rounded-full border-2 border-transparent ${color} animate-plate-drop`
                : 'h-3.5 w-3.5 rounded-full border-2 border-steel-3'
            }
          />
        )
      })}
    </div>
  )
}
