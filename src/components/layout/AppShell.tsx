import { NavLink, Outlet } from 'react-router-dom'
import bandLogoUrl from '../../assets/band-logo.png'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium transition sm:flex-row sm:gap-2 sm:text-sm ${
    isActive
      ? 'text-violet-400'
      : 'text-zinc-500 hover:text-zinc-300'
  }`

const navItems = [
  { to: '/', label: 'Início', icon: '⌂' },
  { to: '/biblioteca', label: 'Biblioteca', icon: '♪' },
  { to: '/setlists', label: 'Setlists', icon: '☰' },
]

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <NavLink
            to="/"
            className="group flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1.5 transition hover:border-violet-700/60 hover:bg-zinc-900"
          >
            <img
              src={bandLogoUrl}
              alt="The Tramps"
              className="h-8 w-8 rounded-md border border-zinc-700/70 object-cover"
            />
            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-tight text-white">
                Setlist<span className="text-violet-400">Studio</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-400 group-hover:text-zinc-300">
                The Tramps Edition
              </div>
            </div>
          </NavLink>
          <nav className="hidden gap-1 sm:flex">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkCls} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-4 sm:px-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-30 flex border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={linkCls} end={to === '/'}>
            <span className="text-base" aria-hidden>
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
