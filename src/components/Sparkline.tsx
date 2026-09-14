import { motion } from 'motion/react'
import { useId } from 'react'

import { monotonePath, type Pt } from '@/lib/chart'

type Props = {
  data: number[]
  /** Color del punto final (el periodo en curso); la línea va en tinta atenuada. */
  endColor: string
  width?: number
  height?: number
}

export function Sparkline({ data, endColor, width = 104, height = 36 }: Props) {
  const id = useId()
  if (data.length < 2) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const pad = 4
  const pts: Pt[] = data.map((v, i) => ({
    x: pad + (i * (width - pad * 2)) / (data.length - 1),
    y: height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2),
  }))
  const last = pts[pts.length - 1]!

  return (
    <svg width={width} height={height} aria-hidden="true" className="shrink-0">
      <motion.path
        key={id + data.join()}
        d={monotonePath(pts)}
        fill="none"
        stroke="var(--color-ink-3)"
        strokeOpacity={0.55}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Punto final con anillo en color de superficie para no perderse sobre la línea */}
      <circle cx={last.x} cy={last.y} r={4} fill={endColor} stroke="var(--color-panel)" strokeWidth={2} />
    </svg>
  )
}
