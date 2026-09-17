import {
  CarFront,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { ActionBar } from '@/components/ActionBar'
import { AssetRow } from '@/components/AssetRow'
import { CardStack } from '@/components/CardStack'
import { deriveCardActivity } from '@/data/derive'
import { ASSETS, type CardCategory, type CardProduct, type CardTxn } from '@/data/mock'
import { formatDayShort, formatMoney, formatPct } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

const CATEGORY: Record<CardCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
}

/** Inicio unificado: portafolio, tarjetas USDT, activos y movimientos. */
export function HomeView() {
  const [activeId, setActiveId] = useState<CardProduct['id']>('card-principal')
  const { card: active, transactions } = deriveCardActivity(activeId)

  // Portafolio y variación de 24 h, derivados de los activos (sin historial).
  const total = ASSETS.reduce((acc, a) => acc + a.usdValue, 0)
  const dayAgo = ASSETS.reduce((acc, a) => acc + a.usdValue / (1 + a.change24h), 0)
  const change24h = dayAgo > 0 ? (total - dayAgo) / dayAgo : 0
  const up = change24h >= 0
  const DeltaIcon = up ? TrendingUp : TrendingDown

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      {/* Portafolio total */}
      <motion.section variants={item} className="mb-4 px-1" aria-label="Portafolio total">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-ink-2">Portafolio total</p>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              up ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
            }`}
          >
            <DeltaIcon size={13} strokeWidth={2.2} />
            {formatPct(change24h)}
          </span>
        </div>

        <AnimatedNumber value={total} format={formatMoney} className="title-large mt-1 block" />
      </motion.section>

      {/* Pila de tarjetas + controles de la activa */}
      <motion.section variants={item} aria-label="Mis tarjetas">
        <CardStack activeId={activeId} onSelect={setActiveId} />
      </motion.section>

      {/* Activos: saldo tras deslizar */}
      <motion.section variants={item} className="mt-6" aria-label="Mis activos">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="title-section">Mis activos</h2>
          <span className="text-xs text-ink-3">{ASSETS.length} activos</span>
        </div>

        <div className="card divide-y divide-line">
          {ASSETS.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      </motion.section>

      {/* Movimientos de la tarjeta seleccionada */}
      <motion.section variants={item} className="card mt-4 p-5" aria-label="Movimientos de la tarjeta">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="title-section">Movimientos</h2>
          <span className="text-xs text-ink-3 tabular-nums">
            USDT {active.descriptor} · últimos {transactions.length}
          </span>
        </div>

        <div className="divide-y divide-line">
          {transactions.map((t) => (
            <TxnRow key={t.id} txn={t} />
          ))}
        </div>
      </motion.section>

      {/* Barra de acciones: no participa del stagger para anclarse al viewport */}
      <ActionBar cardLabel={`USDT ${active.descriptor} •••• ${active.last4}`} />
    </motion.div>
  )
}

function TxnRow({ txn }: { txn: CardTxn }) {
  const meta = CATEGORY[txn.category]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-bright/12 text-red-bright">
        <Icon size={17} strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate headline">{txn.merchant}</p>
        <p className="text-xs text-ink-3">
          {meta.label} · {formatDayShort(txn.date)}
        </p>
      </div>

      <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatMoney(txn.amount)}</p>
    </div>
  )
}
