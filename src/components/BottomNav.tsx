import { CreditCard, HandCoins, Home, Settings, type LucideIcon } from 'lucide-react'
import { LayoutGroup, motion } from 'motion/react'

import type { Tab } from '@/lib/nav'

const TABS: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
  { id: 'creditos', label: 'Créditos', icon: HandCoins },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]

const PILL_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const

/**
 * Navegación inferior: cuatro pestañas con iconos finos y label chico; la
 * activa viaja dentro de un pill resaltado que se mueve con muelle (layoutId).
 * Enviar entra como pantalla sobre la pestaña activa y no vive aquí.
 */
export function BottomNav({ view, onChange }: { view: Tab; onChange: (v: Tab) => void }) {
  return (
    <LayoutGroup>
      <motion.nav
        aria-label="Navegación"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.3 } }}
        className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-white/10 bg-[#101117]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 px-3 py-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange(id)}
                className="relative flex cursor-pointer flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-white"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-2xl border border-white/15 bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                  />
                )}
                <Icon size={19} strokeWidth={1.5} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>
      </motion.nav>
    </LayoutGroup>
  )
}
