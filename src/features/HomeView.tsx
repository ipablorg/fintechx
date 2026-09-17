import { ArrowDownLeft, ArrowUpRight, Bell, ChevronDown, Eye, EyeOff, LayoutGrid, MoreHorizontal, Plus, Send, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { AssetRow } from '@/components/AssetRow'
import { BrandBar } from '@/components/BrandBar'
import { Avatar } from '@/components/Avatar'
import { CardFace } from '@/components/VirtualCard'
import { TxnList } from '@/components/TxnRow'
import { byDateDesc, totalPortfolioUsd } from '@/data/derive'
import { CARDS, USER, type AssetId, type CardProduct, type Contact } from '@/data/mock'
import { CARD_SKIN } from '@/data/skin'
import { AMOUNT_TEXT, MASKED_AMOUNT, formatMoneyParts } from '@/lib/format'
import { TAP_SPRING, container, item } from '@/lib/motion'
import { AssetDetailSheet } from '@/features/AssetDetailSheet'
import { DepositSheet } from '@/features/DepositSheet'
import { MoreSheet } from '@/features/MoreSheet'
import { NewContactSheet } from '@/features/NewContactSheet'
import { NotificationsSheet } from '@/features/NotificationsSheet'
import { ReceiveSheet } from '@/features/ReceiveSheet'
import { WithdrawSheet } from '@/features/WithdrawSheet'
import { useWallet, useWalletActions } from '@/store/use-wallet'

/* Tipografía del monto gigante: la escala compartida, entera en blanco y centavos atenuados. */
const AMOUNT = AMOUNT_TEXT.lg

/** Tiles del Home: depósito, retiro, pagos por Enviar y el menú de Más. */
const TILES: Array<{ id: 'depositar' | 'retirar' | 'pagar' | 'mas'; label: string; icon: LucideIcon }> = [
  { id: 'depositar', label: 'Depositar', icon: ArrowDownLeft },
  { id: 'retirar', label: 'Retirar', icon: ArrowUpRight },
  { id: 'pagar', label: 'Pagar', icon: Send },
  { id: 'mas', label: 'Más', icon: MoreHorizontal },
]

type Sheet = 'depositar' | 'retirar' | 'mas' | 'recibir' | 'notificaciones' | 'contacto'

type Props = {
  /** Tarjeta activa compartida con el tab Tarjetas: alimenta el chip miniatura. */
  activeId: CardProduct['id']
  /** Ir al tab Tarjetas (toca el chip de la tarjeta). */
  onOpenCards: () => void
  /** Abrir Enviar dinero, con contacto y activo preseleccionados opcionales. */
  onSend: (contactId?: Contact['id'], assetId?: AssetId) => void
  /** Abrir el historial completo sobre Inicio. */
  onOpenHistory: () => void
}

/**
 * Inicio: saldo gigante con ojo global, tiles vivos, contactos, activos con
 * detalle tras deslizar y movimientos del store con búsqueda y filtro reales.
 */
export function HomeView({ activeId, onOpenCards, onSend, onOpenHistory }: Props) {
  const { state } = useWallet()
  const { setPref } = useWalletActions()
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [detailAsset, setDetailAsset] = useState<AssetId | null>(null)
  const [receiveAsset, setReceiveAsset] = useState<AssetId>('usdt')

  const { assets, txns, contacts, notifs, prefs } = state
  const total = totalPortfolioUsd(assets)
  const hidden = prefs.hideBalances
  const unread = notifs.filter((n) => !n.read).length
  const active = CARDS.find((c) => c.id === activeId) ?? CARDS[0]!

  // Mezcla reciente de todo el wallet, el más nuevo primero.
  const recent = [...txns].sort(byDateDesc).slice(0, 8)

  const openTile = (id: (typeof TILES)[number]['id']) => {
    if (id === 'pagar') return onSend()
    setSheet(id)
  }

  const closeSheet = () => setSheet(null)

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      {/* Marca por encima del header funcional */}
      <BrandBar />

      {/* Header propio de la vista: menú, plan con foto y notificaciones */}
      <motion.header variants={item} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <motion.button
          type="button"
          aria-label="Más opciones"
          onClick={() => setSheet('mas')}
          data-testid="menu-mas"
          whileTap={{ scale: 0.92 }}
          transition={TAP_SPRING}
          className="glass grid size-9 cursor-pointer place-items-center rounded-2xl text-ink-2"
        >
          <LayoutGrid size={16} strokeWidth={1.5} />
        </motion.button>

        <div className="flex justify-center">
          <span className="glass flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1">
            <Avatar src={USER.avatar} initials={USER.initials} color={USER.color} className="size-7" />
            <span className="text-xs text-ink">Personal</span>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-white/45" />
          </span>
        </div>

        <motion.button
          type="button"
          aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
          onClick={() => setSheet('notificaciones')}
          data-testid="campana"
          whileTap={{ scale: 0.92 }}
          transition={TAP_SPRING}
          className="glass relative grid size-9 cursor-pointer place-items-center rounded-full text-ink-2"
        >
          <Bell size={16} strokeWidth={1.5} />
          {/* Punto de novedades: vive solo mientras haya sin leer y el canal esté activo */}
          {prefs.notifications && unread > 0 && <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2 rounded-full bg-up" data-testid="dot-notificaciones" />}
        </motion.button>
      </motion.header>

      {/* Saldo disponible: selector de tarjeta y monto gigante, ambos centrados */}
      <motion.section variants={item} className="mt-8 text-center" aria-label="Saldo disponible">
        <button
          type="button"
          onClick={onOpenCards}
          aria-label={`Ver tarjetas, activa USDT ${active.descriptor} •••• ${active.last4}`}
          className="mx-auto flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-1 pr-1.5 pl-2 transition-colors hover:bg-white/[0.04]"
        >
          <span className="text-[15px] text-ink-2">Saldo disponible</span>
          <span className="block w-[30px]">
            <CardFace card={active} skin={CARD_SKIN} masked={hidden} style={{ borderRadius: 4 }} />
          </span>
          <ChevronDown size={14} strokeWidth={2} className="text-ink-3" />
        </button>

        <div className="mt-4 flex items-center justify-center gap-2" data-testid="saldo-bloque">
          {hidden ? (
            <span className={AMOUNT} data-testid="saldo-oculto">
              {MASKED_AMOUNT}
            </span>
          ) : (
            <span className="inline-flex items-baseline" data-testid="saldo-total">
              <AnimatedNumber value={total} format={(v) => formatMoneyParts(v).whole} className={AMOUNT} />
              <AnimatedNumber value={total} format={(v) => formatMoneyParts(v).cents} className={`${AMOUNT} text-ink-3`} />
            </span>
          )}
          <button
            type="button"
            onClick={() => setPref('hideBalances', !hidden)}
            aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
            aria-pressed={hidden}
            data-testid="ojo-saldo"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink-2"
          >
            {hidden ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
          </button>
        </div>
      </motion.section>

      {/* Tiles 2×2: vidrio neutro, el color les llega del fondo por el blur */}
      <motion.section variants={item} className="mt-6 grid grid-cols-2 gap-3" aria-label="Acciones">
        {TILES.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => openTile(id)}
            data-testid={`tile-${id}`}
            whileTap={{ scale: 0.96 }}
            transition={TAP_SPRING}
            className="flex cursor-pointer flex-col gap-6 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 text-left backdrop-blur-xl"
          >
            <Icon size={20} strokeWidth={1.5} className="text-ink-2" />
            <span className="text-sm text-ink">{label}</span>
          </motion.button>
        ))}
      </motion.section>

      {/* Acciones rápidas: recibir, contacto nuevo y frecuentes */}
      <motion.section variants={item} className="mt-7" aria-label="Acciones rápidas">
        <h2 className="title-section px-1">Acciones rápidas</h2>
        <div className="-mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => {
              setReceiveAsset('usdt')
              setSheet('recibir')
            }}
            data-testid="accion-recibir"
            className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5"
          >
            <span className="glass grid size-12 place-items-center rounded-full text-ink-2">
              <ArrowDownLeft size={18} strokeWidth={1.5} />
            </span>
            <span className="truncate text-[11px] text-ink-3">Recibir</span>
          </button>

          <button
            type="button"
            onClick={() => setSheet('contacto')}
            data-testid="accion-nuevo-contacto"
            className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5"
          >
            <span className="glass grid size-12 place-items-center rounded-full text-ink-2">
              <Plus size={18} strokeWidth={1.5} />
            </span>
            <span className="truncate text-[11px] text-ink-3">Nuevo</span>
          </button>

          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSend(contact.id)}
              className="flex w-14 shrink-0 cursor-pointer flex-col items-center gap-1.5"
            >
              <Avatar src={contact.avatar || undefined} initials={contact.initials} color={contact.color} className="size-12" />
              <span className="truncate text-[11px] text-ink-3">{contact.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Activos: saldo tras deslizar, y la fila abierta abre el detalle */}
      <motion.section variants={item} className="mt-7" aria-label="Mis activos">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="title-section">Mis activos</h2>
          <span className="text-xs text-ink-3">{assets.length} activos</span>
        </div>

        <div className="glass divide-y divide-white/5 rounded-3xl">
          {assets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} masked={hidden} onOpen={() => setDetailAsset(asset.id)} />
          ))}
        </div>
      </motion.section>

      {/* Movimientos recientes: mezcla del wallet con búsqueda y filtro vivos */}
      <motion.div variants={item}>
        <TxnList txns={recent} caption={`últimos ${recent.length}`} onViewAll={onOpenHistory} />
      </motion.div>

      {/* Hojas de los flujos vivos del Home */}
      <AnimatePresence>
        {sheet === 'depositar' && <DepositSheet key="depositar" onClose={closeSheet} />}
        {sheet === 'retirar' && <WithdrawSheet key="retirar" onClose={closeSheet} />}
        {sheet === 'mas' && <MoreSheet key="mas" onClose={closeSheet} onHistory={onOpenHistory} />}
        {sheet === 'recibir' && <ReceiveSheet key="recibir" assetId={receiveAsset} onClose={closeSheet} />}
        {sheet === 'notificaciones' && <NotificationsSheet key="notificaciones" onClose={closeSheet} />}
        {sheet === 'contacto' && <NewContactSheet key="contacto" onClose={closeSheet} />}
        {detailAsset && (
          <AssetDetailSheet
            key="detalle-activo"
            assetId={detailAsset}
            onClose={() => setDetailAsset(null)}
            onSend={(id) => {
              setDetailAsset(null)
              onSend(undefined, id)
            }}
            onReceive={(id) => {
              setDetailAsset(null)
              setReceiveAsset(id)
              setSheet('recibir')
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
