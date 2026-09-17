import { Copy, Eye, EyeOff, RefreshCw, Snowflake } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { VirtualCard } from '@/components/VirtualCard'
import { deriveCardActivity } from '@/data/derive'
import { CARDS, type CardLimit, type CardProduct } from '@/data/mock'
import { CARD_SKIN } from '@/data/skin'
import tetherWhite from '@/assets/tether-white.svg'

/** Vuelo de las tarjetas entre la pila colapsada y el abanico. */
const FLIGHT = { type: 'spring', stiffness: 350, damping: 32 } as const

/**
 * Canto que asoma de cada tarjeta detrás de la activa, colapsado (px): justo lo
 * que necesita la identificación mínima sin robarle aire a la tarjeta activa.
 */
const PEEK = 26
/**
 * Franja superior que muestra cada tarjeta del abanico (px): saldo, marca y
 * descriptor. El corte cae antes del bloque inferior de la cara.
 */
const STRIP = 130
/** Máximo de cantos visibles colapsados, haya o no más tarjetas en la pila. */
const MAX_PEEK = 2

/**
 * Canto colapsado: identificación mínima (logo + últimos cuatro) alineada a la
 * derecha. Nada de la cara completa: el peek solo nombra la tarjeta.
 */
function PeekFace({ card }: { card: CardProduct }) {
  return (
    <div className="flex h-full items-center justify-end gap-2 rounded-t-2xl border border-white/10 bg-[#101014] pr-4">
      <img src={tetherWhite} alt="" className="h-3.5 w-auto" />
      <span className="text-[11px] tracking-[0.12em] text-white/70 tabular-nums">•••• {card.last4}</span>
    </div>
  )
}

/**
 * Franja del abanico: identificación completa de la tarjeta (logo, USDT,
 * descriptor y últimos cuatro) sin depender de dónde corte la cara completa.
 */
function StripFace({ card }: { card: CardProduct }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-t-2xl border border-white/10 bg-[#101014] py-4 pl-5 pr-4"
      style={{ height: STRIP }}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <img src={tetherWhite} alt="" className="h-4 w-auto" />
        <span className="text-sm font-semibold tracking-[0.04em] text-white">USDT</span>
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
          {card.descriptor}
        </span>
      </span>
      <span className="shrink-0 text-[13px] tracking-[0.12em] text-white/80 tabular-nums">•••• {card.last4}</span>
    </div>
  )
}

/**
 * Pila de tarjetas USDT: cantos mínimos colapsados, abanico hacia arriba y
 * controles (congelar, mostrar, copiar) de la tarjeta activa.
 */
export function CardStack({ activeId, onSelect }: { activeId: CardProduct['id']; onSelect: (id: CardProduct['id']) => void }) {
  const [open, setOpen] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const { card: active, spentThisMonth } = deriveCardActivity(activeId)
  // stacked[0] es la más cercana detrás de la activa; la profunda queda arriba.
  const stacked = CARDS.filter((c) => c.id !== activeId).reverse()

  // Cerrar devuelve el foco a la tarjeta activa: los cantos dejan de ser
  // alcanzables y ningún elemento enfocado queda dentro de un aria-hidden.
  const close = () => {
    setOpen(false)
    document.getElementById('card-activa')?.focus()
  }

  const select = (id: CardProduct['id']) => {
    onSelect(id)
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
      <CollapsedStack
        active={active}
        stacked={stacked}
        open={open}
        flipped={flipped}
        frozen={frozen}
        revealed={revealed}
        limit={{ spent: spentThisMonth, total: active.limit }}
        onToggle={() => (open ? close() : setOpen(true))}
        onClose={close}
        onSelect={select}
        onFlip={() => setFlipped((f) => !f)}
      />

      {/* Controles de la tarjeta activa */}
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
    </LayoutGroup>
  )
}

/**
 * Pila colapsada y abanico. La tarjeta activa queda al frente (z máxima, abajo
 * del grupo); colapsado, cada tarjeta de atrás muestra un canto de PEEK px con
 * su identificación mínima, y al abrir sube para dejar ver una franja de STRIP
 * px de su cara. El padding superior del contenedor crece con el mismo muelle,
 * así el contenido de abajo baja suave y nada se recorta. N se deriva de CARDS,
 * nada está clavado a 3.
 */
function CollapsedStack({
  active,
  stacked,
  open,
  flipped,
  frozen,
  revealed,
  limit,
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
  limit: CardLimit
  onToggle: () => void
  onClose: () => void
  onSelect: (id: CardProduct['id']) => void
  onFlip: () => void
}) {
  // Colapsado asoman como máximo MAX_PEEK cantos; el abanico revela todas.
  // ponytail: al abrir se montan las extras de golpe, sin vuelo desde el canto.
  const peeking = stacked.slice(0, MAX_PEEK)
  const shown = open ? stacked : peeking
  const levels = shown.length

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ paddingTop: open ? stacked.length * STRIP : peeking.length * PEEK }}
      transition={FLIGHT}
    >
      {/* Toque fuera del abanico: colapsa sin cambiar la selección */}
      {open && (
        <button type="button" aria-label="Cerrar abanico" onClick={onClose} className="fixed inset-0 z-30 cursor-default" />
      )}

      {/* Tarjetas de atrás: canto mínimo colapsado, franja amplia en el abanico */}
      {shown.map((card, i) => {
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
                aria-label={`Elegir tarjeta USDT ${card.descriptor} •••• ${card.last4}`}
                className="block w-full cursor-pointer text-left"
              >
                <StripFace card={card} />
              </button>
            ) : (
              <div style={{ height: PEEK }}>
                <PeekFace card={card} />
              </div>
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
          limit={limit}
          flipped={flipped}
          frozen={frozen}
          revealed={revealed}
          skin={CARD_SKIN}
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
