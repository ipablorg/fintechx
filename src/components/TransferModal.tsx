import { Delete, LoaderCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { formatMoney } from '@/lib/format'

const CONTACTS = [
  { id: 'marta', name: 'Marta G.', className: 'from-[#f0a35e] to-[#d95f76]' },
  { id: 'diego', name: 'Diego R.', className: 'from-[#5c6ae0] to-[#8b5ed1]' },
  { id: 'lucia', name: 'Lucía P.', className: 'from-[#2fd18c] to-[#1e9e9e]' },
  { id: 'ana', name: 'Ana T.', className: 'from-[#4e9cf5] to-[#5c6ae0]' },
] as const

type ContactId = (typeof CONTACTS)[number]['id']
type Status = 'idle' | 'sending' | 'done'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'] as const

type Props = {
  open: boolean
  available: number
  onClose: () => void
}

export function TransferModal({ open, available, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && <TransferDialog available={available} onClose={onClose} />}
    </AnimatePresence>
  )
}

/**
 * El estado vive en el diálogo, que se monta al abrir: cada apertura arranca
 * limpia sin resets manuales. AnimatePresence lo mantiene vivo durante la
 * animación de salida.
 */
function TransferDialog({ available, onClose }: { available: number; onClose: () => void }) {
  const [contact, setContact] = useState<ContactId>('marta')
  const [digits, setDigits] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const cents = Number.parseInt(digits || '0', 10)
  const amount = cents / 100
  const contactName = CONTACTS.find((c) => c.id === contact)?.name ?? ''

  // Sincronización con el exterior: foco, bloqueo de scroll y tecla Escape
  useEffect(() => {
    panelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const press = (key: (typeof KEYS)[number]) => {
    if (status !== 'idle') return
    if (key === '⌫') return setDigits((d) => d.slice(0, -1))
    setDigits((d) => (d + key).replace(/^0+(?=\d)/, '').slice(0, 9))
  }

  const send = () => {
    if (cents === 0 || status !== 'idle') return
    setStatus('sending')
    timer.current = setTimeout(() => setStatus('done'), 1000)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Enviar dinero">
      <motion.button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className="card relative w-full max-w-sm p-6 shadow-2xl shadow-black/50 outline-none"
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.18 } }}
        transition={{ type: 'spring', stiffness: 330, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status !== 'done' ? (
            <motion.div key="form" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight">Enviar dinero</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="grid size-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.05] hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 flex justify-between gap-2">
                {CONTACTS.map((c) => {
                  const selected = contact === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setContact(c.id)}
                      aria-pressed={selected}
                      className="group relative flex w-16 flex-col items-center gap-1.5"
                    >
                      <span className="relative">
                        {selected && (
                          <motion.span
                            layoutId="contact-ring"
                            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                            className="absolute -inset-1 rounded-full border-2 border-accent"
                          />
                        )}
                        <span
                          className={`grid size-12 place-items-center rounded-full bg-gradient-to-br text-sm font-semibold text-page ${c.className}`}
                        >
                          {c.name.slice(0, 1)}
                        </span>
                      </span>
                      <span className={`text-[11px] ${selected ? 'text-ink' : 'text-ink-3 group-hover:text-ink-2'}`}>
                        {c.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 text-center">
                <AnimatedNumber
                  value={amount}
                  format={formatMoney}
                  className="text-[42px] leading-none font-semibold tracking-tight"
                />
                <p className="mt-2 text-xs text-ink-3">Disponible: {formatMoney(available)}</p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {KEYS.map((key) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => press(key)}
                    aria-label={key === '⌫' ? 'Borrar' : key}
                    className="grid h-12 place-items-center rounded-xl bg-white/[0.03] text-lg font-medium transition-colors hover:bg-white/[0.07]"
                  >
                    {key === '⌫' ? <Delete size={18} strokeWidth={1.8} /> : key}
                  </motion.button>
                ))}
              </div>

              <motion.button
                type="button"
                onClick={send}
                disabled={cents === 0 || status === 'sending'}
                whileTap={cents > 0 ? { scale: 0.97 } : undefined}
                className="mt-5 grid h-12 w-full place-items-center rounded-xl bg-accent font-semibold text-page shadow-glow transition-opacity disabled:opacity-35 disabled:shadow-none"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === 'sending' ? (
                    <motion.span
                      key="spin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-spin"
                    >
                      <LoaderCircle size={19} strokeWidth={2.2} />
                    </motion.span>
                  ) : (
                    <motion.span key="label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      Enviar {cents > 0 ? formatMoney(amount) : ''}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
                <motion.circle
                  cx="42"
                  cy="42"
                  r="38"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, rotate: -90 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ transformOrigin: '50% 50%' }}
                />
                <motion.path
                  d="M27 43.5 L38 54 L58 32"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, delay: 0.45, ease: 'easeOut' }}
                />
              </svg>
              <h2 className="mt-5 text-lg font-semibold tracking-tight">¡Transferencia enviada!</h2>
              <p className="mt-1 text-sm text-ink-2">
                {formatMoney(amount)} para {contactName}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 h-11 w-full rounded-xl border border-line bg-white/[0.04] font-medium transition-colors hover:bg-white/[0.08]"
              >
                Listo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
