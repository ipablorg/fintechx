import { ArrowLeft, CalendarDays, Check, ChevronDown, Delete, MoreVertical } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

import { AuroraBackground } from '@/components/AuroraBackground'
import { Avatar } from '@/components/Avatar'
import { BottomSheet } from '@/components/BottomSheet'
import { CardFace } from '@/components/VirtualCard'
import { Toggle } from '@/components/Toggle'
import { ASSETS, CARDS, CONTACTS, type Contact } from '@/data/mock'
import { CARD_SKIN } from '@/data/skin'
import { formatMoney } from '@/lib/format'

const SLIDE_SPRING = { type: 'spring', stiffness: 380, damping: 38 } as const

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const

type Props = {
  /** Contacto preseleccionado al abrir la pantalla. */
  contactId: Contact['id']
  /** Volver a Inicio (flecha atrás o éxito del envío). */
  onDone: () => void
}

/**
 * Enviar dinero: pantalla completa sobre Inicio. Monto tecleado en un numpad de
 * vidrio, contacto intercambiable, programación visual y confirmación con un
 * check que se dibuja; regresa sola tras el éxito.
 */
export function SendMoneyView({ contactId, onDone }: Props) {
  const reduced = useReducedMotion()
  const [contact, setContact] = useState(CONTACTS.find((c) => c.id === contactId) ?? CONTACTS[0]!)
  const [amount, setAmount] = useState('0')
  const [scheduled, setScheduled] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sent, setSent] = useState(false)

  const balance = ASSETS.reduce((acc, a) => acc + a.usdValue, 0)
  const card = CARDS[0]!

  // Éxito: el check se dibuja y la pantalla vuelve sola a Inicio.
  useEffect(() => {
    if (!sent) return
    const t = window.setTimeout(onDone, 1200)
    return () => window.clearTimeout(t)
  }, [sent, onDone])

  // El monto es un string tecleado: dos decimales como máximo, un solo punto.
  const press = (key: (typeof KEYS)[number]) => {
    if (sent) return
    setAmount((prev) => {
      if (key === 'del') return prev.length <= 1 ? '0' : prev.slice(0, -1)
      if (key === '.') return prev.includes('.') ? prev : `${prev}.`
      const next = prev === '0' ? key : prev + key
      const decimals = next.split('.')[1]
      return decimals && decimals.length > 2 ? prev : next
    })
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
        {/* Header: volver, contacto y opciones */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="Volver"
            onClick={onDone}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
            <Avatar src={contact.avatar} initials={contact.initials} color={contact.color} className="size-7" />
            <span className="text-xs text-ink">Enviar a {contact.name.split(' ')[0]}</span>
            <ChevronDown size={14} strokeWidth={1.8} className="text-ink-3" />
          </button>

          <motion.button
            type="button"
            aria-label="Más opciones"
            aria-haspopup="dialog"
            onClick={() => setMoreOpen(true)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="glass grid size-10 cursor-pointer place-items-center rounded-full text-ink-2"
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Monto gigante con cursor y moneda */}
        <div className="mt-12 text-center">
          <p className="flex items-baseline justify-center gap-1">
            <span className="text-[46px] leading-none font-bold tracking-tight tabular-nums">{amount}</span>
            <motion.span
              aria-hidden="true"
              animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
              transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              className="h-[0.85em] w-[3px] self-center bg-white/80"
            />
            <span className="ml-2 text-base font-medium text-ink-3">USD</span>
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <p className="text-xs text-ink-3">Saldo disponible {formatMoney(balance)}</p>
            <span className="block w-10">
              <CardFace card={card} skin={CARD_SKIN} style={{ borderRadius: 6 }} />
            </span>
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
          onClick={() => setSent(true)}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="btn btn-primary mt-5 w-full text-sm"
        >
          Enviar dinero
        </motion.button>

        {/* Numpad de vidrio */}
        <div className="mt-auto grid grid-cols-3 gap-3 pt-6" aria-label="Teclado numérico">
          {KEYS.map((key) => (
            <motion.button
              key={key}
              type="button"
              onClick={() => press(key)}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              aria-label={key === 'del' ? 'Borrar' : key}
              className="glass grid h-14 cursor-pointer place-items-center rounded-2xl text-lg font-medium text-ink"
            >
              {key === 'del' ? <Delete size={18} strokeWidth={1.5} /> : key}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selector de contacto */}
      <AnimatePresence>
        {pickerOpen && (
          <BottomSheet key="contactos" label="Enviar a" onClose={() => setPickerOpen(false)}>
            <h2 className="title-section">Enviar a</h2>
            <ul className="mt-3 grid gap-2">
              {CONTACTS.map((c) => {
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
                      <Avatar src={c.avatar} initials={c.initials} color={c.color} className="size-9" />
                      <span className="flex-1 text-sm text-ink">{c.name}</span>
                      {selected && <Check size={16} strokeWidth={2.2} className="text-white" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Más opciones: placeholder del mismo patrón que las hojas de Inicio */}
      <AnimatePresence>
        {moreOpen && (
          <BottomSheet key="mas" label="Más opciones" onClose={() => setMoreOpen(false)}>
            <h2 className="title-section">Más opciones</h2>
            <p className="mt-1 text-sm text-ink-2">Disponible próximamente en la beta</p>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Éxito: check dibujado y regreso automático */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-page/95 backdrop-blur-sm"
            role="status"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="glass grid size-24 place-items-center rounded-full"
            >
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
