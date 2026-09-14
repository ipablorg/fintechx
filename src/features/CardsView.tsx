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
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'motion/react'
import { useState, type CSSProperties } from 'react'

import baLogotipo from '@/assets/ba-logotipo.png'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { VirtualCard } from '@/components/VirtualCard'
import { deriveCardActivity } from '@/data/derive'
import { CARDS, getAsset, type CardCategory, type CardProduct } from '@/data/mock'
import { formatDayShort, formatMoney, formatRate } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Vuelo de la tarjeta entre la pila y el slot principal. */
const FLIGHT = { type: 'spring', stiffness: 350, damping: 32 } as const

/** Franja visible de cada tarjeta apilada (≥44 px táctiles). */
const STRIP_H = 60
const STRIP_OVERLAP = 14
const STACK_DEPTH = [
  { scale: 0.97, brightness: 0.85 },
  { scale: 0.94, brightness: 0.72 },
]

const CATEGORY: Record<CardCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
}

/** Borde 1px + glow exterior en el color de marca del activo (datos, no hardcode). */
function assetSkin(color: string, strong = false): CSSProperties {
  return {
    border: `1px solid color-mix(in srgb, ${color} 60%, transparent)`,
    boxShadow: `0 0 70px -18px color-mix(in srgb, ${color} ${strong ? 55 : 40}%, transparent)`,
  }
}

/** Tarjetas: pila estilo Wallet, límite mensual y movimientos por tarjeta. */
export function CardsView() {
  const [activeId, setActiveId] = useState<CardProduct['id']>('card-usdt')
  const [frozen, setFrozen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const { card: active, transactions, spentThisMonth } = deriveCardActivity(activeId)
  const activeAsset = getAsset(active.assetId)
  const stacked = CARDS.filter((c) => c.id !== activeId)
  const ratio = Math.min(1, spentThisMonth / active.limit)

  const select = (id: CardProduct['id']) => {
    if (id === activeId) return
    setActiveId(id)
    setFrozen(false)
    setRevealed(false)
  }

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(active.number)
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

      {/* Pila estilo Wallet: tarjeta activa + resto apilado debajo */}
      <motion.div variants={item}>
        <LayoutGroup>
          {/* Slot principal: la tarjeta activa vuela aquí (montaje propio por tarjeta) */}
          {active && (
            <motion.div key={active.id} layoutId={active.id} transition={FLIGHT} className="relative z-20">
              <VirtualCard card={active} frozen={frozen} revealed={revealed} skin={assetSkin(activeAsset.color, true)} />
            </motion.div>
          )}

          {/* Pila: franja superior de cada tarjeta inactiva */}
          <div className="mt-3">
            {stacked.map((card, i) => {
              const asset = getAsset(card.assetId)
              const depth = STACK_DEPTH[i] ?? STACK_DEPTH[STACK_DEPTH.length - 1]!
              return (
                <motion.button
                  key={card.id}
                  layoutId={card.id}
                  layout
                  type="button"
                  onClick={() => select(card.id)}
                  aria-label={`Seleccionar tarjeta ${card.asset}`}
                  transition={FLIGHT}
                  className="relative flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] px-4 text-left backdrop-blur-2xl"
                  style={{
                    height: STRIP_H,
                    marginTop: i === 0 ? 0 : -STRIP_OVERLAP,
                    zIndex: 10 - i,
                    scale: depth.scale,
                    filter: `brightness(${depth.brightness})`,
                    transformOrigin: 'top center',
                    ...assetSkin(asset.color),
                  }}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full"
                    style={{ background: `color-mix(in srgb, ${asset.color} 18%, transparent)` }}
                  >
                    <img src={asset.icon} alt="" className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">Tarjeta {card.asset}</span>
                    <span className="block text-xs text-ink-3 tabular-nums">•••• {card.last4}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-3">Usar</span>
                </motion.button>
              )
            })}
          </div>
        </LayoutGroup>
      </motion.div>

      {/* Controles de la tarjeta activa */}
      <motion.div variants={item} className="mt-4 grid grid-cols-3 gap-2">
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
      </motion.div>

      {/* Contenido dependiente de la tarjeta seleccionada */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* Límite mensual */}
          <section className="card mt-5 p-5" aria-label="Límite mensual">
            <div className="flex items-baseline justify-between">
              <h2 className="title-section">Límite mensual</h2>
              <span className="text-xs text-ink-3 tabular-nums">{formatRate(ratio)} del límite</span>
            </div>

            <AnimatedNumber value={spentThisMonth} format={formatMoney} className="title-large mt-2 block" />

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-bank/15"
              role="meter"
              aria-valuenow={Math.round(ratio * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${formatMoney(spentThisMonth)} de ${formatMoney(active.limit)}`}
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
              Has usado {formatMoney(spentThisMonth)} de {formatMoney(active.limit)}
            </p>
          </section>

          {/* Movimientos */}
          <section className="card mt-4 p-5" aria-label="Movimientos de la tarjeta">
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
          </section>
        </motion.div>
      </AnimatePresence>

      {/* Co-brand */}
      <motion.footer variants={item} className="mt-6 flex items-center justify-center gap-2 pb-2">
        <img src={baLogotipo} alt="" className="h-4 w-auto" />
        <p className="text-[11px] text-ink-3">Tarjeta emitida por Banco Amazonas · Ecuador</p>
      </motion.footer>
    </motion.div>
  )
}
