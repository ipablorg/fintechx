import { Delete } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { AMOUNT_TEXT, type AmountSize } from '@/lib/format'
import { TAP_SPRING } from '@/lib/motion'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const

export type NumKey = (typeof KEYS)[number]

/** Teclado numérico de vidrio: la cuadrícula 3×4 compartida por todos los flujos. */
export function AmountPad({ onPress, disabled = false }: { onPress: (key: NumKey) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3" aria-label="Teclado numérico">
      {KEYS.map((key) => (
        <motion.button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onPress(key)}
          whileTap={{ scale: 0.94 }}
          transition={TAP_SPRING}
          aria-label={key === 'del' ? 'Borrar' : key}
          className="glass grid h-14 cursor-pointer place-items-center rounded-2xl text-lg font-medium text-ink disabled:cursor-default disabled:opacity-50"
        >
          {key === 'del' ? <Delete size={18} strokeWidth={1.5} /> : key}
        </motion.button>
      ))}
    </div>
  )
}

/**
 * Monto gigante centrado con pista e error inline: la cabecera compartida de
 * todos los flujos de monto. `size` escala la cifra y `cursor` agrega el caret
 * parpadeante de los flujos que se teclean a pantalla completa.
 */
export function AmountView({
  amount,
  hint,
  error,
  size = 'md',
  cursor = false,
}: {
  amount: string
  hint?: ReactNode
  error?: string | null
  size?: AmountSize
  cursor?: boolean
}) {
  const reduced = useReducedMotion()

  return (
    <div className="text-center" aria-live="polite">
      <p className="flex items-baseline justify-center gap-1.5">
        <span className={AMOUNT_TEXT[size]}>{amount}</span>
        {cursor && (
          <motion.span
            aria-hidden="true"
            animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            className="h-[0.85em] w-[3px] self-center bg-white/80"
          />
        )}
        <span className="text-base font-medium text-ink-3">USD</span>
      </p>

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-bright" data-testid="error-monto">
          {error}
        </p>
      ) : (
        hint && <p className="mt-3 text-xs text-ink-3">{hint}</p>
      )}
    </div>
  )
}
