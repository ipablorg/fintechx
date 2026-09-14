import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { clamp } from '@/lib/chart'

type Props = {
  /** Posición x objetivo (px, relativa al contenedor de la gráfica). */
  x: number
  containerWidth: number
  visible: boolean
  children: ReactNode
}

/** Tooltip flotante que persigue el crosshair con un muelle. */
export function ChartTooltip({ x, containerWidth, visible, children }: Props) {
  const clamped = clamp(x, 72, Math.max(containerWidth - 72, 72))
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true">
      <motion.div
        className="absolute top-1 left-0"
        initial={false}
        animate={{ x: clamped, opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96 }}
        transition={{ type: 'spring', stiffness: 480, damping: 40, mass: 0.7 }}
      >
        <div className="w-max -translate-x-1/2 rounded-xl border border-line bg-panel-2/95 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur-md">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
