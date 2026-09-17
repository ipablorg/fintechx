import { motion } from 'motion/react'

import { BrandBar } from '@/components/BrandBar'
import { CardStack } from '@/components/CardStack'
import { TxnList } from '@/components/TxnRow'
import { deriveCardActivity } from '@/data/derive'
import { CARDS, type CardProduct } from '@/data/mock'
import { useWallet } from '@/store/use-wallet'
import { container, item } from '@/lib/motion'

/**
 * Tarjetas: pila completa con abanico, flip con límite y controles, más el
 * historial completo de la tarjeta seleccionada, servido del store.
 */
export function CardsView({ activeId, onSelect }: { activeId: CardProduct['id']; onSelect: (id: CardProduct['id']) => void }) {
  const { state } = useWallet()
  const card = CARDS.find((c) => c.id === activeId) ?? CARDS[0]!
  const { transactions, spentThisMonth } = deriveCardActivity(state.txns, activeId)
  const masked = state.prefs.hideBalances

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <BrandBar />

      <motion.section variants={item} aria-label="Mis tarjetas">
        <div className="mb-4 px-1">
          <h1 className="title-large">Mis tarjetas</h1>
          <p className="mt-1 text-xs text-ink-3">Todas liquidan en USDT. Toca la pila para cambiar de tarjeta.</p>
        </div>

        <CardStack card={card} spentThisMonth={spentThisMonth} masked={masked} onSelect={onSelect} />
      </motion.section>

      {/* Movimientos completos de la tarjeta seleccionada */}
      <motion.div variants={item}>
        <TxnList txns={transactions} caption={`USDT ${card.descriptor} · ${transactions.length}`} />
      </motion.div>
    </motion.div>
  )
}
