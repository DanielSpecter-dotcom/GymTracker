import { NavLink, useLocation } from 'react-router-dom'
import { HomeIcon, BarbellIcon, TrendingUpIcon } from './Icon'

const TABS = [
  { to: '/', label: 'Inicio', Icon: HomeIcon },
  { to: '/routines', label: 'Rutinas', Icon: BarbellIcon },
  { to: '/history', label: 'Historial', Icon: TrendingUpIcon },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const activeIndex = pathname === '/' ? 0 : pathname === '/history' ? 2 : 1

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-steel-3 bg-steel/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto flex max-w-md">
        <span
          className="absolute top-0 h-0.5 w-1/3 bg-plate-red transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map(({ to, label, Icon }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium tracking-wide transition-colors ${
              activeIndex === i ? 'text-chalk' : 'text-chalk-dim'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
