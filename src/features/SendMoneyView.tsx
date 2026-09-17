import { ArrowDownLeft, ArrowLeft, CalendarDays, Check, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { AuroraBackground } from '@/components/AuroraBackground'
import { AmountPad, AmountView } from '@/components/AmountPad'
import { Avatar } from '@/components/Avatar'
import { BottomSheet } from '@/components/BottomSheet'
import { SuccessCheck } from '@/components/SuccessCheck'
import { Toggle } from '@/components/Toggle'
import { assetUsd, assetOrFirst } from '@/data/derive'
import { type AssetId, type Contact } from '@/data/mock'
import { formatMoney, formatUnits } from '@/lib/format'
import { SLIDE_SPRING, TAP_SPRING } from '@/lib/motion'
import { useAmountInput } from '@/lib/useAmountInput'
import { ReceiveSheet } from '@/features/ReceiveSheet'
import { useWallet, useWalletActions } from '@/store/use-wallet'

const ASSET_IDS: AssetId[] = ['usdt', 'usdc', 'btc']

type Props = {
  /** Contacto preseleccionado al abrir la pantalla. */
  contactId: Contact['id']
  /** Activo con el que se envía, preconfigurado desde el detalle del activo. */
  assetId: AssetId
  /** Volver a Inicio (flecha atrás o éxito del envío). */
  onDone: () => void
}

/**
 * Enviar dinero: pantalla completa sobre Inicio. Monto validado contra el saldo
 * real del activo elegido, contacto intercambiable y confirmación con el check
 * dibujado; al confirmar el store baja el saldo y agrega el movimiento.
 */
export function SendMoneyView({ contactId, assetId, onDone }: Props) {
  const { state } = useWallet()
  const { send } = useWalletActions()
  // La semilla nunca deja la lista vacía: el fallback es el primero del store.
  const [contact, setContact] = useState(state.contacts.find((c) => c.id === contactId) ?? state.contacts[0]!)
  const [asset, setAsset] = useState<AssetId>(assetId)
  const [scheduled, setScheduled] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const source = assetOrFirst(state.assets, asset)
  const balance = assetUsd(source)
  const { amount, press, value, blocked, error } = useAmountInput('0', { max: balance })

  const submit = () => {
    if (blocked) return
    send(contact.id, asset, value)
    setSent(true)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%', transition: { duration: 0.25, ease: 'easeIn' } }}
      transition={SLIDE_SPRING}
      className="fixed inset-0 z-[60] mx-auto max-w-md overflow-y-auto bg-page"
      role="dialog"
      aria-modal="true"
      aria-label="Enviar dinero"
    >
      <AuroraBackground />

      <div className="flex min-h-dvh flex-col px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+20px)]">
        {/* Header: volver y contacto */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="Volver"
            onClick={onDone}
            whileTap={{ scale: 0.92 }}
            transition={TAP_SPRING}
            className="glass grid size-10 cursor-pointer place-items-center rounded-full text-ink-2"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </motion.button>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-haspopup="dialog"
            className="glass flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2.5"
          >
            <Avatar src={contact.avatar || undefined} initials={contact.initials} color={contact.color} className="size-7" />
            <span className="text-xs text-ink">Enviar a {contact.name.split(' ')[0]}</span>
            <ChevronDown size={14} strokeWidth={1.8} className="text-ink-3" />
          </button>

          {/* Empate del header: mantiene el contacto centrado */}
          <span aria-hidden="true" className="size-10" />
        </div>

        {/* Monto gigante: la cabecera compartida, en su tamaño de pantalla completa */}
        <div className="mt-10 text-center">
          <AmountView amount={amount} size="lg" cursor />

          {error && amount !== '0' && (
            <p className="mt-3 text-sm font-medium text-red-bright" data-testid="error-envio" aria-live="polite">
              {error}
            </p>
          )}

          {/* Saldo del activo elegido y acceso a recibir dentro de Enviar */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <p className="text-xs text-ink-3">
              Saldo disponible {formatMoney(balance)} · {formatUnits(source.balance)} {source.symbol}
            </p>
            <button
              type="button"
              onClick={() => setReceiveOpen(true)}
              data-testid="enviar-recibir"
              className="glass flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs text-ink-2 transition-colors hover:text-ink"
            >
              <ArrowDownLeft size={12} strokeWidth={2} />
              Recibir
            </button>
          </div>

          {/* Activo con el que sale el dinero */}
          <div className="mt-4 flex justify-center gap-1.5" role="group" aria-label="Activo a enviar">
            {ASSET_IDS.map((id) => {
              const a = assetOrFirst(state.assets, id)
              const selected = id === asset
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAsset(id)}
                  data-testid={`activo-${id}`}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected ? 'border-white bg-white text-black' : 'border-line bg-panel-2/60 text-ink-2 hover:text-ink'
                  }`}
                >
                  <img src={a.icon} alt="" className="size-3.5" />
                  {a.symbol}
                </button>
              )
            })}
          </div>
        </div>

        {/* Programación del pago */}
        <div className="glass mt-8 flex items-center gap-3 rounded-full p-2 pr-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
            <CalendarDays size={16} strokeWidth={1.5} />
          </span>
          <span className="flex-1 text-sm text-ink">Programar este pago</span>
          <Toggle checked={scheduled} onChange={setScheduled} label="Programar este pago" />
        </div>

        {/* Confirmación */}
        <motion.button
          type="button"
          onClick={submit}
          whileTap={{ scale: 0.97 }}
          transition={TAP_SPRING}
          data-testid="confirmar-envio"
          className="btn btn-primary mt-5 w-full text-sm"
        >
          Enviar dinero
        </motion.button>

        {/* Numpad de vidrio */}
        <div className="mt-auto pt-6">
          <AmountPad onPress={press} disabled={sent} />
        </div>
      </div>

      {/* Selector de contacto, alimentado por el store */}
      <AnimatePresence>
        {pickerOpen && (
          <BottomSheet key="contactos" label="Enviar a" onClose={() => setPickerOpen(false)}>
            <h2 className="title-section">Enviar a</h2>
            <ul className="mt-3 grid gap-2">
              {state.contacts.map((c) => {
                const selected = c.id === contact.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setContact(c)
                        setPickerOpen(false)
                      }}
                      aria-pressed={selected}
                      className="glass flex w-full cursor-pointer items-center gap-3 rounded-full p-2 pr-4 text-left"
                    >
                      <Avatar src={c.avatar || undefined} initials={c.initials} color={c.color} className="size-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{c.name}</span>
                        <span className="block truncate text-[11px] text-ink-3">{c.handle}</span>
                      </span>
                      {selected && <Check size={16} strokeWidth={2.2} className="text-white" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Recibir dentro de Enviar, con el activo seleccionado */}
      <AnimatePresence>{receiveOpen && <ReceiveSheet key="recibir" assetId={asset} onClose={() => setReceiveOpen(false)} />}</AnimatePresence>

      {/* Éxito: check dibujado y regreso automático */}
      <AnimatePresence>
        {sent && (
          <SuccessCheck
            title="Envío realizado"
            sub={`${contact.name.split(' ')[0]} recibió ${formatMoney(value)}`}
            onDone={onDone}
            delay={1200}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
