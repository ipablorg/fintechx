import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { useSlideToAct } from '@/lib/useSlideToAct'

const THUMB = 48 // px, lado del pulgar
const PAD = 8 // px, aire entre el pulgar y el borde de la pista
/** Fracción del recorrido que completa el gesto al soltar. */
const COMPLETE_RATIO = 0.8
/** Espera tras el check antes de ingresar a la app (con movimiento reducido, casi nula). */
const DONE_DELAY_MS = 400
const DONE_DELAY_REDUCED_MS = 60
const DONE_SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const

/**
 * CTA deslizable de la bienvenida: el relleno crece con el avance y al pasar
 * ~80 % del recorrido el pulgar termina a la derecha, cambia a check y dispara
 * el ingreso. Debajo del umbral vuelve con muelle. El gesto es de un solo uso.
 */
export function SlideToStart({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [completed, setCompleted] = useState(false)
  const done = useRef(false)

  const complete = () => {
    if (done.current) return
    done.current = true
    setCompleted(true)
  }

  const { trackRef, travel, dragProps } = useSlideToAct({
    thumb: THUMB,
    pad: PAD,
    ratio: COMPLETE_RATIO,
    onAct: complete,
  })

  // El relleno nace tapado por el pulgar y crece con el mismo valor del drag.
  const x = useMotionValue(0)
  const fillWidth = useTransform(x, (v) => Math.max(THUMB, v + THUMB))

  // Tras completar, el pulgar vuela a la derecha y recién entonces se ingresa.
  useEffect(() => {
    if (!completed) return
    const t = window.setTimeout(onDone, reduced ? DONE_DELAY_REDUCED_MS : DONE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [completed, onDone, reduced])

  return (
    <div
      ref={trackRef}
      className="relative h-16 overflow-hidden rounded-full border border-line bg-panel-2/70"
    >
      {/* Relleno detrás del pulgar, guiado por el avance del drag */}
      <motion.div
        aria-hidden="true"
        style={{ width: fillWidth }}
        className="absolute inset-y-0 left-2 rounded-full bg-white/[0.07]"
      />

      <motion.div
        aria-hidden={completed}
        animate={{ opacity: completed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5"
      >
        <span className="shimmer-text text-[12px] font-medium whitespace-nowrap">Desliza para comenzar</span>
        <motion.span
          className="flex text-ink-3"
          animate={reduced ? undefined : { x: [0, 4, 0], opacity: [0.4, 1, 0.4] }}
          transition={reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronRight size={14} strokeWidth={2.2} />
          <ChevronRight size={14} strokeWidth={2.2} className="-ml-2" />
        </motion.span>
      </motion.div>

      <motion.button
        type="button"
        aria-label="Desliza para comenzar"
        style={{ x, width: THUMB, height: THUMB, top: PAD, left: PAD }}
        drag={completed ? false : 'x'}
        dragConstraints={{ left: 0, right: travel }}
        dragElastic={0.06}
        dragSnapToOrigin={!completed}
        dragMomentum={false}
        animate={completed ? { x: travel } : undefined}
        transition={reduced ? { duration: 0 } : DONE_SPRING}
        {...dragProps}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          complete()
        }}
        className="absolute z-10 grid cursor-grab touch-none place-items-center rounded-full border border-line bg-panel text-ink-2 shadow-lg active:cursor-grabbing"
        whileTap={completed ? undefined : { scale: 0.96 }}
      >
        <motion.span
          key={completed ? 'check' : 'arrow'}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          className="grid place-items-center"
        >
          {completed ? <Check size={20} strokeWidth={2.2} className="text-bank" /> : <ArrowRight size={20} strokeWidth={2.2} />}
        </motion.span>
      </motion.button>
    </div>
  )
}
