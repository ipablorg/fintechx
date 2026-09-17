import { motion } from 'motion/react'

const KNOB_SPRING = { type: 'spring', stiffness: 500, damping: 32 } as const

// ponytail: espejos de --color-page y --color-ink-2 (backgroundColor animado no lee tokens).
const KNOB_ON = '#0c0d13'
const KNOB_OFF = '#a39fab'

/**
 * Interruptor estilo iOS: pista clara cuando está activo (el lenguaje del
 * primario blanco) y perilla que viaja con muelle.
 */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors ${
        checked ? 'border-white bg-white' : 'border-white/15 bg-white/10'
      }`}
    >
      <motion.span
        animate={{ x: checked ? 20 : 0, backgroundColor: checked ? KNOB_ON : KNOB_OFF }}
        transition={KNOB_SPRING}
        className="absolute top-0.5 left-0.5 size-6 rounded-full"
      />
    </button>
  )
}
