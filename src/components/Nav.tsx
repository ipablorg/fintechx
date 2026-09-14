import { motion } from 'motion/react'

import { NAV_ITEMS, type ViewId } from '@/components/nav-items'

export type { ViewId }

const navSpring = { type: 'spring', stiffness: 480, damping: 40 } as const

type NavProps = {
  view: ViewId
  onChange: (v: ViewId) => void
}

/** Tab bar inferior de la app: panel superior redondeado, desenfocado y fijo. */
export function Nav({ view, onChange }: NavProps) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-line bg-panel/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-3 py-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const activeItem = view === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={activeItem ? 'page' : undefined}
              aria-label={label}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-full py-1.5 text-[11px] font-medium transition-colors ${
                activeItem ? 'text-bank-bright' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {activeItem && (
                <motion.span
                  layoutId="nav-pill"
                  transition={navSpring}
                  className="absolute inset-0 rounded-full bg-bank/12"
                />
              )}
              <Icon size={19} strokeWidth={1.9} className="relative" />
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
