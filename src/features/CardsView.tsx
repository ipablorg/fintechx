import {
  CarFront,
  Coffee,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Snowflake,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'motion/react'
import { useEffect, useState, type CSSProperties } from 'react'

import baLogotipo from '@/assets/ba-logotipo.png'
import { CardFace, VirtualCard } from '@/components/VirtualCard'
import { deriveCardActivity } from '@/data/derive'
import { CARDS, type CardCategory, type CardProduct } from '@/data/mock'
import { formatDayShort, formatMoney, formatRate } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Vuelo de las tarjetas entre la pila colapsada y el abanico. */
const FLIGHT = { type: 'spring', stiffness: 350, damping: 32 } as const

/** Canto que asoma de cada tarjeta detrás de la activa, colapsado (px). */
const PEEK = 48
/**
 * Franja superior que muestra cada tarjeta del abanico (px): logo, nombre y
 * últimos cuatro, y el número enmascarado completo. El corte cae entre el
 * número y la fila inferior, sin trozar texto.
 */
const STRIP = 130

const CATEGORY: Record<CardCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
}

/**
 * Skin Tether único para todas las tarjetas: reemplaza al criterio anterior de
 * borde y glow por color de activo. El acento del sistema sigue siendo teal.
 */
function tetherSkin(strong = false): CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, #108852 60%, transparent)',
    boxShadow: `0 0 70px -18px rgb(16 133 82 / ${strong ? 0.55 : 0.4})`,
  }
}

/** Tarjetas: pila colapsada con canto visible, abanico hacia arriba y detalle por tarjeta. */
export function CardsView() {
  const [activeId, setActiveId] = useState<CardProduct['id']>('card-usdt')
  const [open, setOpen] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const { card: active, transactions, spentThisMonth } = deriveCardActivity(activeId)
  const ratio = Math.min(1, spentThisMonth / active.limit)
  // stacked[0] es la más cercana detrás de la activa; la profunda queda arriba.
  const stacked = CARDS.filter((c) => c.id !== activeId).slice().reverse()

  // Cerrar devuelve el foco a la tarjeta activa: los cantos dejan de ser
  // alcanzables y ningún elemento enfocado queda dentro de un aria-hidden.
  const close = () => {
    setOpen(false)
    document.getElementById('card-activa')?.focus()
  }

  const select = (id: CardProduct['id']) => {
    setActiveId(id)
    setFlipped(false)
    setFrozen(false)
    setRevealed(false)
    setOpen(false)
  }

  // Escape colapsa el abanico sin cambiar la selección.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
    <LayoutGroup>
      <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
        <motion.div variants={item} className="mb-4 px-1">
          <h1 className="title-large">Tarjetas</h1>
          <p className="mt-1 text-xs text-ink-3">Tu tarjeta virtual · powered by Banco Amazonas</p>
        </motion.div>

        {/* Pila colapsada: cantos asomando detrás de la tarjeta activa */}
        <motion.div variants={item}>
          <CollapsedStack
            active={active}
            stacked={stacked}
            open={open}
            flipped={flipped}
            frozen={frozen}
            revealed={revealed}
            onToggle={() => (open ? close() : setOpen(true))}
            onClose={close}
            onSelect={select}
            onFlip={() => setFlipped((f) => !f)}
          />
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

              <p className="title-large mt-2 block tabular-nums">{formatMoney(spentThisMonth)}</p>

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
    </LayoutGroup>
  )
}

/**
 * Pila colapsada y abanico. La tarjeta activa queda al frente (z máxima, abajo
 * del grupo) y el resto sube por encima de ella al abrir: cada una muestra una
 * franja superior de STRIP px con su identificación. El padding superior del
 * contenedor crece con el mismo muelle, así el contenido de abajo baja suave y
 * nada se recorta. N se deriva de CARDS, nada está clavado a 3.
 */
function CollapsedStack({
  active,
  stacked,
  open,
  flipped,
  frozen,
  revealed,
  onToggle,
  onClose,
  onSelect,
  onFlip,
}: {
  active: CardProduct
  stacked: CardProduct[]
  open: boolean
  flipped: boolean
  frozen: boolean
  revealed: boolean
  onToggle: () => void
  onClose: () => void
  onSelect: (id: CardProduct['id']) => void
  onFlip: () => void
}) {
  const levels = stacked.length

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ paddingTop: levels * (open ? STRIP : PEEK) }}
      transition={FLIGHT}
    >
      {/* Toque fuera del abanico: colapsa sin cambiar la selección */}
      {open && (
        <button type="button" aria-label="Cerrar abanico" onClick={onClose} className="fixed inset-0 z-30 cursor-default" />
      )}

      {/* Tarjetas de atrás: canto de PEEK px colapsadas, franja de STRIP px en el abanico */}
      {stacked.map((card, i) => {
        const depth = i + 1
        return (
          <motion.div
            key={card.id}
            layoutId={card.id}
            initial={false}
            animate={{ y: open ? (levels - 1 - i) * (STRIP - PEEK) : 0 }}
            transition={FLIGHT}
            aria-hidden={!open}
            className={open ? 'absolute inset-x-0' : 'pointer-events-none absolute inset-x-0'}
            style={{
              top: (levels - 1 - i) * PEEK,
              zIndex: open ? 31 + (levels - depth) : levels - depth,
              scale: Math.max(0.96, 1 - depth * 0.02),
              filter: `brightness(${1 - depth * 0.07})`,
              willChange: 'transform',
            }}
          >
            {open ? (
              <button
                type="button"
                onClick={() => onSelect(card.id)}
                aria-label={`Elegir tarjeta ${card.asset} •••• ${card.last4}`}
                className="block w-full cursor-pointer text-left"
              >
                <CardFace card={card} />
              </button>
            ) : (
              <CardFace card={card} />
            )}
          </motion.div>
        )
      })}

      {/* Tarjeta activa al frente: el toque alterna el abanico */}
      <motion.div
        key={active.id}
        layoutId={active.id}
        transition={FLIGHT}
        className="relative"
        style={{ zIndex: open ? 40 : 20 }}
      >
        <VirtualCard
          id="card-activa"
          card={active}
          flipped={flipped}
          frozen={frozen}
          revealed={revealed}
          skin={tetherSkin(true)}
          onClick={onToggle}
          ariaLabel="Cambiar de tarjeta"
          ariaExpanded={open}
        />
        {/* Volteo explícito: botón propio para no pelear con el tap que abre el abanico */}
        {!open && (
          <button
            type="button"
            aria-label="Ver reverso"
            aria-pressed={flipped}
            onClick={onFlip}
            className="absolute right-3 bottom-3 z-30 grid size-11 place-items-center rounded-full border border-white/25 bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65"
          >
            <RefreshCw size={18} strokeWidth={2} />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
