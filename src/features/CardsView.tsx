import { motion, type Variants } from 'motion/react'

import { CardStack } from '@/components/CardStack'
import { TxnList } from '@/components/TxnRow'
import { byDateDesc, deriveCardActivity } from '@/data/derive'
import type { CardProduct } from '@/data/mock'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/**
 * Tarjetas: pila completa con abanico, flip con límite y controles, más el
 * historial completo de la tarjeta seleccionada.
 */
export function CardsView({ activeId, onSelect }: { activeId: CardProduct['id']; onSelect: (id: CardProduct['id']) => void }) {
  const { card: active } = deriveCardActivity(activeId)
  // Historial completo de la activa, el más nuevo primero.
  const transactions = [...active.activity].sort(byDateDesc)

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <motion.section variants={item} aria-label="Mis tarjetas">
        <div className="mb-4 px-1">
          <h1 className="title-large">Mis tarjetas</h1>
          <p className="mt-1 text-xs text-ink-3">Todas liquidan en USDT. Toca la pila para cambiar de tarjeta.</p>
        </div>

        <CardStack activeId={activeId} onSelect={onSelect} />
      </motion.section>

      {/* Movimientos completos de la tarjeta seleccionada */}
      <motion.div variants={item}>
        <TxnList txns={transactions} caption={`USDT ${active.descriptor} · ${transactions.length}`} />
      </motion.div>
    </motion.div>
  )
}
