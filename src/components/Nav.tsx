import { motion } from 'motion/react'

import { NAV_ITEMS, type ViewId } from '@/components/nav-items'

export type { ViewId }

const navSpring = { type: 'spring', stiffness: 480, damping: 40 } as const

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 px-2" aria-label="FintechX, inicio">
      <img src="/logo.svg" alt="" className="size-8 rounded-[9px]" />
      <span className="text-[15px] font-semibold tracking-tight">
        Fintech<span className="text-accent">X</span>
      </span>
    </a>
  )
}

type NavProps = {
  view: ViewId
  onChange: (v: ViewId) => void
}

export function Sidebar({ view, onChange }: NavProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-6 border-r border-line bg-panel/40 px-4 py-6 backdrop-blur-xl lg:flex">
      <Logo />
      <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const activeItem = view === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={activeItem ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                activeItem ? 'text-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {activeItem && (
                <motion.span
                  layoutId="nav-pill"
                  transition={navSpring}
                  className="absolute inset-0 rounded-xl border border-white/[0.05] bg-white/[0.06]"
                />
              )}
              <Icon size={17} strokeWidth={1.9} className={`relative ${activeItem ? 'text-accent' : ''}`} />
              <span className="relative font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
        <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-series-2/80 text-xs font-semibold text-page">
          PB
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">Pablo</span>
          <span className="block truncate text-[11px] text-ink-3">pablo@loopay.com</span>
        </span>
      </div>
    </aside>
  )
}

export function BottomNav({ view, onChange }: NavProps) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const activeItem = view === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={activeItem ? 'page' : undefined}
              aria-label={label}
              className={`relative flex flex-col items-center gap-1 px-3 pt-3 pb-2.5 text-[10px] font-medium transition-colors ${
                activeItem ? 'text-accent' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {activeItem && (
                <motion.span
                  layoutId="nav-dot"
                  transition={navSpring}
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent"
                />
              )}
              <Icon size={19} strokeWidth={1.9} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
