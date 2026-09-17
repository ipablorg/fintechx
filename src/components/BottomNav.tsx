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
 * Navegación inferior: cápsula flotante de vidrio separada de los bordes, con
 * cuatro pestañas de icono fino y label chico. La activa viaja dentro de un
 * pill translúcido que se mueve con muelle (layoutId): vidrio sobre vidrio, sin
 * relleno sólido ni acento de color. Enviar entra como pantalla sobre la
 * pestaña activa y no vive aquí.
 */
export function BottomNav({ view, onChange }: { view: Tab; onChange: (v: Tab) => void }) {
  return (
    <LayoutGroup>
      <motion.nav
        aria-label="Navegación"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.3 } }}
        className="fixed inset-x-3.5 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-30 mx-auto max-w-md rounded-full border border-white/[0.08] bg-black/70 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8)] backdrop-blur-xl"
      >
        <div className="grid grid-cols-4 gap-1 p-1.5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange(id)}
                className="relative flex cursor-pointer flex-col items-center gap-1 rounded-full py-2 text-[11px] leading-none font-medium text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-white"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.06]"
                  />
                )}
                <Icon size={20} strokeWidth={1.5} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>
      </motion.nav>
    </LayoutGroup>
  )
}
