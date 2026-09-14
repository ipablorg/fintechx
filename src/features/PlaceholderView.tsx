import { motion } from 'motion/react'

import { NAV_ITEMS, type ViewId } from '@/components/nav-items'

export function PlaceholderView({ view }: { view: ViewId }) {
  const nav = NAV_ITEMS.find((n) => n.id === view)
  if (!nav) return null
  const Icon = nav.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 28 } }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.16 } }}
      className="card mt-6 flex flex-col items-center px-6 py-24 text-center"
    >
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 18, delay: 0.08 } }}
        className="grid size-16 place-items-center rounded-2xl border border-line bg-white/[0.04] text-accent"
      >
        <Icon size={26} strokeWidth={1.7} />
      </motion.span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{nav.label}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-ink-3">
        Esta sección llegará pronto. El starter incluye el dashboard de Inicio como referencia de
        patrones de UI, animación y datos.
      </p>
    </motion.div>
  )
}
