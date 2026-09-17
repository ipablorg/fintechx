import { ArrowDownLeft, ArrowUpRight, CreditCard, QrCode, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'

const ACTIONS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'retirar', label: 'Retirar', icon: ArrowUpRight },
  { id: 'depositar', label: 'Depositar', icon: ArrowDownLeft },
  { id: 'pagar', label: 'Pagar', icon: QrCode },
]

/**
 * Barra de acciones fijas (no navegación) del pie: cada acción abre una hoja
 * inferior arrastrable. La hoja vive aquí para que la barra y el velo compartan
 * el mismo estado.
 */
export function ActionBar({ cardLabel }: { cardLabel: string }) {
  const [openAction, setOpenAction] = useState<string | null>(null)
  const action = ACTIONS.find((a) => a.id === openAction)

  return (
    <>
      <motion.nav
        aria-label="Acciones"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
        className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-line bg-panel/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-3 py-2">
          {ACTIONS.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={openAction === id}
              onClick={() => setOpenAction(id)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-full py-1.5 text-[11px] font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <Icon size={19} strokeWidth={1.9} />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <AnimatePresence>
        {action && (
          <BottomSheet key={action.id} label={action.label} onClose={() => setOpenAction(null)}>
            <h2 className="title-section">{action.label}</h2>
            <p className="mt-1 text-sm text-ink-2">Disponible próximamente en la beta</p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-panel-2/60 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                <CreditCard size={17} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-ink-3">Tarjeta seleccionada</p>
                <p className="truncate headline tabular-nums">{cardLabel}</p>
              </div>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  )
}
