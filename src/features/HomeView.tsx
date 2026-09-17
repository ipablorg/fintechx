import { ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, Eye, EyeOff, MoreHorizontal, Plus, Send, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useState } from 'react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { AssetRow } from '@/components/AssetRow'
import { Avatar } from '@/components/Avatar'
import { BottomSheet } from '@/components/BottomSheet'
import { CardFace } from '@/components/VirtualCard'
import { TxnList } from '@/components/TxnRow'
import { ASSETS, CARDS, CONTACTS, USER, type CardProduct, type Contact } from '@/data/mock'
import { byDateDesc, totalPortfolioUsd } from '@/data/derive'
import { CARD_SKIN } from '@/data/skin'
import { formatMoney } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Tiles del Home: Depositar/Retirar abren hoja, Pagar va a Enviar, Más a placeholders. */
const TILES: Array<{ id: 'depositar' | 'retirar' | 'pagar' | 'mas'; label: string; icon: LucideIcon }> = [
  { id: 'depositar', label: 'Depositar', icon: ArrowDownLeft },
  { id: 'retirar', label: 'Retirar', icon: ArrowUpRight },
  { id: 'pagar', label: 'Pagar', icon: Send },
  { id: 'mas', label: 'Más', icon: MoreHorizontal },
]

type Sheet = 'depositar' | 'retirar' | 'mas'
const SHEET_LABEL: Record<Sheet, string> = {
  depositar: 'Depositar',
  retirar: 'Retirar',
  mas: 'Más opciones',
}

type Props = {
  /** Tarjeta activa compartida con el tab Tarjetas: alimenta el chip miniatura. */
  activeId: CardProduct['id']
  /** Ir al tab Tarjetas (toca el chip de la tarjeta). */
  onOpenCards: () => void
  /** Abrir Enviar dinero, con contacto preseleccionado opcional. */
  onSend: (contactId?: Contact['id']) => void
}

/**
 * Inicio: saldo gigante con ojo, tiles de vidrio, contactos rápidos, activos
 * con saldo tras deslizar y los movimientos recientes de todas las tarjetas.
 */
export function HomeView({ activeId, onOpenCards, onSend }: Props) {
  const [hidden, setHidden] = useState(false)
  const [sheet, setSheet] = useState<Sheet | null>(null)

  const total = totalPortfolioUsd()
  const active = CARDS.find((c) => c.id === activeId) ?? CARDS[0]!

  // Mezcla reciente de las tres tarjetas, ordenada por fecha descendente.
  const recent = CARDS.flatMap((card) => card.activity).sort(byDateDesc)
    .slice(0, 6)

  const openTile = (id: (typeof TILES)[number]['id']) => {
    if (id === 'pagar') return onSend()
    setSheet(id)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      {/* Header propio de la vista: perfil, plan y notificaciones */}
      <motion.header variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar initials={USER.initials} color={USER.color} className="size-9" />
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-ink-2">Personal</span>
        </div>
        <motion.button
          type="button"
          aria-label="Notificaciones"
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="glass grid size-9 cursor-pointer place-items-center rounded-full text-ink-2"
        >
          <Bell size={16} strokeWidth={1.5} />
        </motion.button>
      </motion.header>

      {/* Saldo disponible: monto gigante con ojo y chip de la tarjeta activa */}
      <motion.section variants={item} className="mt-6" aria-label="Saldo disponible">
        <div className="flex items-start justify-between gap-3 px-1">
          <p className="pt-1 text-sm text-ink-2">Saldo disponible</p>

          <button
            type="button"
            onClick={onOpenCards}
            aria-label={`Ver tarjetas, activa USDT ${active.descriptor} •••• ${active.last4}`}
            className="glass flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2"
          >
            <span className="block w-14">
              <CardFace card={active} skin={CARD_SKIN} style={{ borderRadius: 8 }} />
            </span>
            <ChevronRight size={14} strokeWidth={2} className="text-ink-3" />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2 px-1">
          {hidden ? (
            <span className="title-large">$••••••</span>
          ) : (
            <AnimatedNumber value={total} format={formatMoney} className="title-large" />
          )}
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
            aria-pressed={hidden}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink-2"
          >
            {hidden ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
          </button>
        </div>
      </motion.section>

      {/* Tiles 2×2 de vidrio */}
      <motion.section variants={item} className="mt-6 grid grid-cols-2 gap-3" aria-label="Acciones">
        {TILES.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => openTile(id)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="glass flex cursor-pointer flex-col gap-6 rounded-3xl p-4 text-left"
          >
            <Icon size={20} strokeWidth={1.5} className="text-ink-2" />
            <span className="text-sm text-ink">{label}</span>
          </motion.button>
        ))}
      </motion.section>

      {/* Acciones rápidas: contacto nuevo + frecuentes con avatar de iniciales */}
      <motion.section variants={item} className="mt-7" aria-label="Acciones rápidas">
        <h2 className="title-section px-1">Acciones rápidas</h2>
        <div className="-mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setSheet('mas')}
            className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5"
          >
            <span className="glass grid size-12 place-items-center rounded-full text-ink-2">
              <Plus size={18} strokeWidth={1.5} />
            </span>
            <span className="truncate text-[11px] text-ink-3">Nuevo</span>
          </button>

          {CONTACTS.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSend(contact.id)}
              className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5"
            >
              <Avatar initials={contact.initials} color={contact.color} className="size-12" />
              <span className="truncate text-[11px] text-ink-3">{contact.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Activos: saldo tras deslizar */}
      <motion.section variants={item} className="mt-7" aria-label="Mis activos">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="title-section">Mis activos</h2>
          <span className="text-xs text-ink-3">{ASSETS.length} activos</span>
        </div>

        <div className="glass divide-y divide-white/5 rounded-3xl">
          {ASSETS.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      </motion.section>

      {/* Movimientos recientes: mezcla de todas las tarjetas */}
      <motion.div variants={item}>
        <TxnList txns={recent} caption={`últimos ${recent.length}`} />
      </motion.div>

      {/* Hojas de depósito, retiro y placeholders de "Más" */}
      <AnimatePresence>
        {sheet && (
          <BottomSheet key={sheet} label={SHEET_LABEL[sheet]} onClose={() => setSheet(null)}>
            <h2 className="title-section">{SHEET_LABEL[sheet]}</h2>
            <p className="mt-1 text-sm text-ink-2">Disponible próximamente en la beta</p>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
