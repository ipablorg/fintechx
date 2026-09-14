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
  X,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import baLogotipo from '@/assets/ba-logotipo.png'
import { CardFace, VirtualCard } from '@/components/VirtualCard'
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

/** Vuelo de las tarjetas entre la pila colapsada y el selector. */
const FLIGHT = { type: 'spring', stiffness: 350, damping: 32 } as const

/** Separación entre tops desplegadas en el selector (px). */
const SELECTOR_STEP = 150
/** Canto que asoma de cada tarjeta detrás de la activa, colapsado (px). */
const PEEK = 48

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

/** Tarjetas: pila colapsada con canto visible, selector desplegable y detalle por tarjeta. */
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

  const close = () => setOpen(false)

  const select = (id: CardProduct['id']) => {
    setActiveId(id)
    setFlipped(false)
    setFrozen(false)
    setRevealed(false)
    setOpen(false)
  }

  // Escape cierra el selector sin cambiar la selección.
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
            onOpen={() => setOpen(true)}
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

        {/* Selector desplegable */}
        <AnimatePresence>{open && <Selector activeId={active.id} onSelect={select} onClose={close} />}</AnimatePresence>
      </motion.div>
    </LayoutGroup>
  )
}

/**
 * Pila colapsada: la tarjeta activa al frente (z máxima, abajo del grupo) y el
 * resto asomando por su canto superior. La altura del grupo se reserva sola:
 * tarjeta + (N−1) cantos. N se deriva de CARDS, nada está clavado a 3.
 */
function CollapsedStack({
  active,
  stacked,
  open,
  flipped,
  frozen,
  revealed,
  onOpen,
  onFlip,
}: {
  active: CardProduct
  stacked: CardProduct[]
  open: boolean
  flipped: boolean
  frozen: boolean
  revealed: boolean
  onOpen: () => void
  onFlip: () => void
}) {
  const activeAsset = getAsset(active.assetId)
  const levels = stacked.length

  return (
    // padding-top en el contenedor: reserva el alto de los cantos y evita el
    // colapso de margen que desalinearía los cantos respecto de la activa.
    <div className="relative" style={{ paddingTop: levels * PEEK }}>
      {/* Cantos detrás de la activa (no interactivos: el selector los expone) */}
      {!open &&
        stacked.map((card, i) => {
          const depth = i + 1
          return (
            <motion.div
              key={card.id}
              layoutId={card.id}
              transition={FLIGHT}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0"
              style={{
                top: (levels - 1 - i) * PEEK,
                zIndex: levels - depth,
                scale: Math.max(0.96, 1 - depth * 0.02),
                filter: `brightness(${1 - depth * 0.07})`,
                willChange: 'transform',
              }}
            >
              <CardFace card={card} skin={assetSkin(getAsset(card.assetId).color)} />
            </motion.div>
          )
        })}

      {/* Tarjeta activa al frente, abajo del grupo */}
      {!open && (
        <motion.div
          key={active.id}
          layoutId={active.id}
          transition={FLIGHT}
          className="relative z-20"
        >
          <VirtualCard
            card={active}
            flipped={flipped}
            frozen={frozen}
            revealed={revealed}
            skin={assetSkin(activeAsset.color, true)}
            onClick={onOpen}
            ariaLabel="Cambiar de tarjeta"
            ariaExpanded={open}
          />
          {/* Volteo explícito: botón propio para no pelear con el tap que abre el selector */}
          <button
            type="button"
            aria-label="Ver reverso"
            aria-pressed={flipped}
            onClick={onFlip}
            className="absolute right-3 bottom-3 z-30 grid size-11 place-items-center rounded-full border border-white/25 bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65"
          >
            <RefreshCw size={18} strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </div>
  )
}

/** Selector abierto: tarjetas desplegadas con scroll, sobre un velo que atenúa el contenido. */
function Selector({
  activeId,
  onSelect,
  onClose,
}: {
  activeId: CardProduct['id']
  onSelect: (id: CardProduct['id']) => void
  onClose: () => void
}) {
  // El solape se mide sobre la tarjeta real: cada cara muestra ~SELECTOR_STEP px.
  const firstCard = useRef<HTMLButtonElement>(null)
  const [overlap, setOverlap] = useState(0)

  useEffect(() => {
    const width = firstCard.current?.offsetWidth
    if (width) setOverlap(width / 1.586 - SELECTOR_STEP)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Velo: atenúa el contenido de abajo; tocarlo cierra sin cambiar la selección */}
      <button
        type="button"
        aria-label="Cerrar selector"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-page/75 backdrop-blur-[2px]"
      />

      <div className="@container absolute inset-x-0 top-14 mx-auto flex h-[calc(100%-9rem)] max-w-md flex-col px-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <p className="text-xs font-medium text-ink-2">Elige tu tarjeta</p>
          <button type="button" onClick={onClose} className="btn btn-ghost px-3 py-1.5 text-[11px]">
            <X size={13} strokeWidth={2.2} />
            Cerrar
          </button>
        </div>

        <div className="-mx-1 flex-1 overflow-y-auto overscroll-contain px-1 pb-10" style={{ scrollbarWidth: 'thin' }}>
          {CARDS.map((card, i) => {
            const spent = deriveCardActivity(card.id).spentThisMonth
            return (
              <motion.button
                key={card.id}
                layoutId={card.id}
                layout
                type="button"
                onClick={() => onSelect(card.id)}
                aria-label={`Elegir tarjeta ${card.asset}, gastado ${formatMoney(spent)} de ${formatMoney(card.limit)}`}
                aria-current={card.id === activeId ? 'true' : undefined}
                transition={FLIGHT}
                className="relative block w-full cursor-pointer text-left"
                ref={i === 0 ? firstCard : undefined}
                style={{
                  marginTop: i === 0 || !overlap ? 0 : -overlap,
                  zIndex: CARDS.length - i,
                  willChange: 'transform',
                }}
              >
                <CardFace card={card} skin={assetSkin(getAsset(card.assetId).color, card.id === activeId)} />
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
