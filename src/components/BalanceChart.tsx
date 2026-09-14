import { motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useState } from 'react'

import { ChartTooltip } from '@/components/ChartTooltip'
import type { BalancePoint } from '@/data/derive'
import { areaPath, clamp, monotonePath, niceTicks, type Pt } from '@/lib/chart'
import { formatDayShort, formatMoney, formatTick } from '@/lib/format'
import { useMeasure } from '@/lib/useMeasure'

const PLOT_H = 200
const AXIS_H = 26
const PAD_X = 6
const PAD_T = 16
const HEIGHT = PLOT_H + AXIS_H

type Props = {
  points: BalancePoint[]
  /** Cambia con el rango para re-dibujar la entrada de la línea. */
  rangeKey: number
  /** Color de serie; debe contrastar ≥3:1 contra el panel. */
  color?: string
}

export function BalanceChart({ points, rangeKey, color = 'var(--color-tether)' }: Props) {
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const gradId = useId()

  const n = points.length

  const geom = useMemo(() => {
    if (width < 60 || n < 2) return null
    const values = points.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || max || 1
    const domMin = min - span * 0.1
    const domMax = max + span * 0.12
    const y = (v: number) => PAD_T + ((domMax - v) / (domMax - domMin)) * (PLOT_H - PAD_T)
    const step = (width - PAD_X * 2) / (n - 1)
    const x = (i: number) => PAD_X + i * step
    const pts: Pt[] = points.map((p, i) => ({ x: x(i), y: y(p.value) }))
    const ticks = niceTicks(domMin, domMax, 4).filter((t) => t >= domMin && t <= domMax)
    const labelIdx = [...new Set([0, Math.round((n - 1) / 3), Math.round(((n - 1) * 2) / 3), n - 1])]
    return { pts, ticks, y, x, step, labelIdx }
  }, [width, n, points])

  const pick = (clientX: number, el: Element) => {
    if (!geom) return
    const rect = el.getBoundingClientRect()
    const idx = clamp(Math.round((clientX - rect.left - PAD_X) / geom.step), 0, n - 1)
    setActive(idx)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape') return
    e.preventDefault()
    if (e.key === 'Escape') return setActive(null)
    const dir = e.key === 'ArrowLeft' ? -1 : 1
    setActive((a) => clamp((a ?? n - 1) + dir, 0, n - 1))
  }

  const activePoint = active !== null ? points[active] : undefined
  const last = points[n - 1]

  return (
    <div
      ref={ref}
      className="relative outline-offset-4"
      tabIndex={0}
      role="img"
      aria-label={
        last
          ? `Evolución del portafolio. Valor actual ${formatMoney(last.value)}. Usa las flechas para recorrer los días.`
          : 'Evolución del portafolio'
      }
      onKeyDown={onKeyDown}
      onFocus={() => setActive((a) => a ?? n - 1)}
      onBlur={() => setActive(null)}
    >
      {geom && (
        <>
          <svg
            width={width}
            height={HEIGHT}
            className="block touch-none"
            aria-hidden="true"
            onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
            onPointerDown={(e) => pick(e.clientX, e.currentTarget)}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid hairline + etiquetas de eje Y dentro del plano */}
            {geom.ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={width} y1={geom.y(t)} y2={geom.y(t)} stroke="var(--color-grid)" strokeWidth={1} />
                <text x={2} y={geom.y(t) - 5} fontSize={10.5} fill="var(--color-ink-3)">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            <line x1={0} x2={width} y1={PLOT_H} y2={PLOT_H} stroke="var(--color-line)" strokeWidth={1} />

            {/* Área (lavado ~10 %) y línea con dibujado de entrada */}
            <motion.path
              key={`area-${rangeKey}`}
              d={areaPath(geom.pts, PLOT_H)}
              fill={`url(#${gradId})`}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.path
              key={`line-${rangeKey}`}
              d={monotonePath(geom.pts)}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
            />

            {/* Punto vivo al final de la serie */}
            {(() => {
              const end = geom.pts[geom.pts.length - 1]!
              return (
                <g>
                  {!reduced && (
                    <motion.circle
                      cx={end.x}
                      cy={end.y}
                      fill={color}
                      initial={{ r: 4, opacity: 0.45 }}
                      animate={{ r: 15, opacity: 0 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
                    />
                  )}
                  <circle cx={end.x} cy={end.y} r={4.5} fill={color} stroke="var(--color-panel)" strokeWidth={2} />
                </g>
              )
            })()}

            {/* Crosshair + punto activo */}
            {active !== null && activePoint && (
              <g>
                <line
                  x1={geom.x(active)}
                  x2={geom.x(active)}
                  y1={PAD_T - 6}
                  y2={PLOT_H}
                  stroke="var(--color-ink-3)"
                  strokeOpacity={0.45}
                  strokeWidth={1}
                />
                <circle
                  cx={geom.x(active)}
                  cy={geom.pts[active]!.y}
                  r={4.5}
                  fill={color}
                  stroke="var(--color-panel)"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Eje X: fechas seleccionadas */}
            {geom.labelIdx.map((i) => {
              const p = points[i]
              if (!p) return null
              const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
              return (
                <text key={i} x={geom.x(i)} y={PLOT_H + 17} fontSize={10.5} fill="var(--color-ink-3)" textAnchor={anchor}>
                  {formatDayShort(p.date)}
                </text>
              )
            })}
          </svg>

          <ChartTooltip x={active !== null ? geom.x(active) : 0} containerWidth={width} visible={active !== null && !!activePoint}>
            <p className="text-[11px] text-ink-3">{activePoint ? formatDayShort(activePoint.date) : ''}</p>
            <p className="text-sm font-semibold tracking-tight text-ink">
              {activePoint ? formatMoney(activePoint.value) : ''}
            </p>
          </ChartTooltip>
        </>
      )}
      {!geom && <div style={{ height: HEIGHT }} />}
    </div>
  )
}
