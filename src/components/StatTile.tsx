import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Sparkline } from '@/components/Sparkline'
import type { Delta } from '@/data/derive'
import { formatMoney, formatPct } from '@/lib/format'

type Props = {
  label: string
  value: number
  delta: Delta
  /** ¿Subir es bueno? (ingresos sí, gastos no) — decide el color del delta. */
  upIsGood: boolean
  spark: number[]
  /** Color de la serie a la que pertenece esta métrica (identidad constante). */
  seriesColor: string
}

export function StatTile({ label, value, delta, upIsGood, spark, seriesColor }: Props) {
  const pct = delta.pct
  const direction = pct === null || pct === 0 ? 0 : pct > 0 ? 1 : -1
  const good = direction === 0 ? null : direction > 0 ? upIsGood : !upIsGood

  return (
    <div className="card flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-sm text-ink-2">{label}</p>
        <AnimatedNumber
          value={value}
          format={formatMoney}
          className="mt-1 block text-2xl font-semibold tracking-tight"
        />
        <p className="mt-1.5 text-xs text-ink-3">
          {pct !== null && (
            <span className={good === null ? 'text-ink-2' : good ? 'text-up' : 'text-down'}>
              {formatPct(pct)}
            </span>
          )}
          {pct === null ? 'sin periodo anterior' : ' vs. periodo anterior'}
        </p>
      </div>
      <Sparkline data={spark} endColor={seriesColor} />
    </div>
  )
}
