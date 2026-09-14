import { motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useState } from 'react'

import { ChartTooltip } from '@/components/ChartTooltip'
import type { Bucket } from '@/data/derive'
import { niceTicks } from '@/lib/chart'
import { formatMoney, formatTick } from '@/lib/format'
import { useMeasure } from '@/lib/useMeasure'

const PLOT_H = 208
const AXIS_H = 26
const PAD_T = 14
const HEIGHT = PLOT_H + AXIS_H
/** Radio del extremo superior de la barra (el pie queda recto contra la base). */
const R = 4

type Props = {
  buckets: Bucket[]
  rangeKey: number
}

export function CashflowChart({ buckets, rangeKey }: Props) {
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const clipId = useId()

  const n = buckets.length

  const geom = useMemo(() => {
    if (width < 60 || n === 0) return null
    const maxVal = Math.max(1, ...buckets.map((b) => Math.max(b.income, b.expense)))
    const domMax = maxVal * 1.08
    const y = (v: number) => PAD_T + (1 - v / domMax) * (PLOT_H - PAD_T)
    const band = width / n
    const barW = Math.max(6, Math.min(22, band * 0.26))
    const ticks = niceTicks(0, domMax, 4).filter((t) => t > 0 && t <= domMax)
    const labelEvery = band < 52 ? 2 : 1
    return { y, band, barW, ticks, labelEvery }
  }, [width, n, buckets])

  const spring = { type: 'spring', stiffness: 170, damping: 26, mass: 0.9 } as const

  return (
    <div ref={ref} className="relative">
      {geom && (
        <>
          <svg width={width} height={HEIGHT} className="block touch-none" onPointerLeave={() => setActive(null)}>
            <defs>
              {/* Recorta al área del plot: el pie redondeado de las barras queda oculto bajo la base */}
              <clipPath id={clipId}>
                <rect x={0} y={0} width={width} height={PLOT_H} />
              </clipPath>
            </defs>

            {geom.ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={width} y1={geom.y(t)} y2={geom.y(t)} stroke="var(--color-grid)" strokeWidth={1} />
                <text x={2} y={geom.y(t) - 5} fontSize={10.5} fill="var(--color-ink-3)">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            <line x1={0} x2={width} y1={PLOT_H} y2={PLOT_H} stroke="var(--color-line)" strokeWidth={1} />

            {/* Realce de la banda activa */}
            {active !== null && (
              <rect
                x={active * geom.band + 2}
                y={PAD_T - 6}
                width={geom.band - 4}
                height={PLOT_H - PAD_T + 6}
                rx={10}
                fill="rgb(255 255 255 / 0.035)"
              />
            )}

            <g clipPath={`url(#${clipId})`}>
              {buckets.map((b, i) => {
                const cx = i * geom.band + geom.band / 2
                // Separación de 2 px en color de superficie entre barras contiguas
                const xIncome = cx - 1 - geom.barW
                const xExpense = cx + 1
                const hIncome = PLOT_H - geom.y(b.income)
                const hExpense = PLOT_H - geom.y(b.expense)
                const dim = active !== null && active !== i
                return (
                  <motion.g key={`${rangeKey}-${b.key}`} animate={{ opacity: dim ? 0.45 : 1 }} transition={{ duration: 0.15 }}>
                    <motion.rect
                      x={xIncome}
                      width={geom.barW}
                      rx={Math.min(R, geom.barW / 2)}
                      fill="var(--color-series-1)"
                      initial={reduced ? { y: geom.y(b.income), height: hIncome + R } : { y: PLOT_H, height: 0 }}
                      animate={{ y: geom.y(b.income), height: hIncome + R }}
                      transition={{ ...spring, delay: reduced ? 0 : i * 0.045 }}
                    />
                    <motion.rect
                      x={xExpense}
                      width={geom.barW}
                      rx={Math.min(R, geom.barW / 2)}
                      fill="var(--color-series-2)"
                      initial={reduced ? { y: geom.y(b.expense), height: hExpense + R } : { y: PLOT_H, height: 0 }}
                      animate={{ y: geom.y(b.expense), height: hExpense + R }}
                      transition={{ ...spring, delay: reduced ? 0 : i * 0.045 + 0.06 }}
                    />
                  </motion.g>
                )
              })}
            </g>

            {/* Zonas de impacto por banda: hover + foco de teclado */}
            {buckets.map((b, i) => (
              <rect
                key={b.key}
                x={i * geom.band}
                y={0}
                width={geom.band}
                height={PLOT_H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${b.long}: ingresos ${formatMoney(b.income)}, gastos ${formatMoney(b.expense)}`}
                className="outline-none"
                onPointerMove={() => setActive(i)}
                onPointerDown={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}

            {buckets.map((b, i) =>
              i % geom.labelEvery === 0 ? (
                <text
                  key={b.key}
                  x={i * geom.band + geom.band / 2}
                  y={PLOT_H + 17}
                  fontSize={10.5}
                  fill="var(--color-ink-3)"
                  textAnchor="middle"
                >
                  {b.label}
                </text>
              ) : null,
            )}
          </svg>

          <ChartTooltip
            x={active !== null ? active * geom.band + geom.band / 2 : 0}
            containerWidth={width}
            visible={active !== null}
          >
            {active !== null && buckets[active] && (
              <>
                <p className="mb-1 text-[11px] text-ink-3">{buckets[active].long}</p>
                {(
                  [
                    { color: 'var(--color-series-1)', value: buckets[active].income, name: 'Ingresos' },
                    { color: 'var(--color-series-2)', value: buckets[active].expense, name: 'Gastos' },
                  ] as const
                ).map((row) => (
                  <p key={row.name} className="flex items-center gap-2 text-sm">
                    <span className="h-[3px] w-3 rounded-full" style={{ background: row.color }} aria-hidden="true" />
                    <span className="font-semibold tracking-tight text-ink">{formatMoney(row.value)}</span>
                    <span className="text-xs text-ink-3">{row.name}</span>
                  </p>
                ))}
              </>
            )}
          </ChartTooltip>
        </>
      )}
      {!geom && <div style={{ height: HEIGHT }} />}
    </div>
  )
}
