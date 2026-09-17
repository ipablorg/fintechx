import { Copy, Eye, EyeOff, RefreshCw, Snowflake } from 'lucide-react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { CardFace, VirtualCard } from '@/components/VirtualCard'
import { deriveCardActivity } from '@/data/derive'
import { CARDS, type CardLimit, type CardProduct } from '@/data/mock'
import { tetherSkin } from '@/data/skin'

/** Vuelo de las tarjetas entre la pila colapsada y el abanico. */
const FLIGHT = { type: 'spring', stiffness: 350, damping: 32 } as const

/**
 * Canto que asoma de cada tarjeta detrás de la activa, colapsado (px). Calza
 * justo con la franja de identificación de la cara: el corte cae bajo el texto,
 * nunca a media letra.
 */
const PEEK = 36
/**
 * Franja superior que muestra cada tarjeta del abanico (px): logo, activo,
 * descriptor y últimos cuatro. El corte cae entre el número y la fila inferior.
 */
const STRIP = 130

/**
 * Pila de tarjetas USDT: canto compacto colapsado, abanico hacia arriba y
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
                aria-label={`Elegir tarjeta USDT ${card.descriptor} •••• ${card.last4}`}
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
          limit={limit}
          flipped={flipped}
          frozen={frozen}
          revealed={revealed}
          skin={tetherSkin()}
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
