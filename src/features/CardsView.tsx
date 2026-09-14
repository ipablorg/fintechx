import {
  CarFront,
  Coffee,
  Copy,
  Eye,
  EyeOff,
  ShoppingBag,
  ShoppingCart,
  Snowflake,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useState } from 'react'

import baLogotipo from '@/assets/ba-logotipo.png'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { VirtualCard } from '@/components/VirtualCard'
import { deriveCardActivity } from '@/data/derive'
import { CARD, type CardCategory } from '@/data/mock'
import { formatDayShort, formatMoney, formatRate } from '@/lib/format'

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

/** Tarjetas: tarjeta virtual tokenizada, límite mensual y movimientos. */
export function CardsView() {
  const { transactions, spentThisMonth } = deriveCardActivity()
  const [frozen, setFrozen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const ratio = Math.min(1, spentThisMonth / CARD.limit)

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(CARD.number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Portapapeles no disponible (permisos o contexto inseguro).
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <motion.div variants={item} className="mb-4 px-1">
        <h1 className="title-large">Tarjetas</h1>
        <p className="mt-1 text-xs text-ink-3">Tu tarjeta virtual · powered by Banco Amazonas</p>
      </motion.div>

      {/* Tarjeta + controles */}
      <motion.div variants={item}>
        <VirtualCard frozen={frozen} revealed={revealed} />

        <div className="mt-4 grid grid-cols-3 gap-2">
          <motion.button
            type="button"
            aria-pressed={frozen}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => setFrozen((f) => !f)}
            className="btn btn-ghost flex-col gap-1 py-3 text-[11px]"
          >
            <Snowflake size={18} strokeWidth={1.9} />
            {frozen ? 'Descongelar' : 'Congelar'}
          </motion.button>

          <motion.button
            type="button"
            aria-pressed={revealed}
            aria-label={revealed ? 'Ocultar número de tarjeta' : 'Mostrar número de tarjeta'}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={() => setRevealed((r) => !r)}
            className="btn btn-ghost flex-col gap-1 py-3 text-[11px]"
          >
            {revealed ? <EyeOff size={18} strokeWidth={1.9} /> : <Eye size={18} strokeWidth={1.9} />}
            {revealed ? 'Ocultar' : 'Mostrar'}
          </motion.button>

          <motion.button
            type="button"
            aria-label="Copiar número de tarjeta"
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={copyNumber}
            className="btn btn-ghost flex-col gap-1 py-3 text-[11px]"
          >
            <Copy size={18} strokeWidth={1.9} />
            <span className="relative inline-flex h-4 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? 'copiado' : 'copiar'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Límite mensual */}
      <motion.section variants={item} className="card mt-5 p-5" aria-label="Límite mensual">
        <div className="flex items-baseline justify-between">
          <h2 className="title-section">Límite mensual</h2>
          <span className="text-xs text-ink-3 tabular-nums">{formatRate(ratio)} del límite</span>
        </div>

        <AnimatedNumber
          value={spentThisMonth}
          format={formatMoney}
          className="title-large mt-2 block"
        />

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-bank/15"
          role="meter"
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${formatMoney(spentThisMonth)} de ${formatMoney(CARD.limit)}`}
          aria-label="Uso del límite mensual"
        >
          <motion.div
            className="h-full rounded-full bg-red-bright"
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          />
        </div>

        <p className="mt-2 text-xs text-ink-3">
          Has usado {formatMoney(spentThisMonth)} de {formatMoney(CARD.limit)}
        </p>
      </motion.section>

      {/* Movimientos */}
      <motion.section variants={item} className="card mt-4 p-5" aria-label="Movimientos de la tarjeta">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="title-section">Movimientos de la tarjeta</h2>
          <span className="text-xs text-ink-3">últimos {transactions.length}</span>
        </div>

        <div className="divide-y divide-line">
          {transactions.map((t) => {
            const meta = CATEGORY[t.category]
            const Icon = meta.icon
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-bright/12 text-red-bright">
                  <Icon size={17} strokeWidth={1.9} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate headline">{t.merchant}</p>
                  <p className="text-xs text-ink-3">
                    {meta.label} · {formatDayShort(t.date)}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatMoney(t.amount)}</p>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Co-brand */}
      <motion.footer variants={item} className="mt-6 flex items-center justify-center gap-2 pb-2">
        <img src={baLogotipo} alt="" className="h-4 w-auto" />
        <p className="text-[11px] text-ink-3">Tarjeta emitida por Banco Amazonas · Ecuador</p>
      </motion.footer>
    </motion.div>
  )
}
