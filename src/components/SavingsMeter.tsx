import { motion } from 'motion/react'

import { formatMoney, formatPct } from '@/lib/format'

type Props = {
  /** Tasa de ahorro 0–1 (puede ser negativa); null si no hubo ingresos. */
  rate: number | null
  net: number
  income: number
}

/**
 * Medidor de tasa de ahorro. El riel es un paso claro de la misma rampa que el
 * relleno, para que el estado se lea a lo largo de toda la barra.
 */
export function SavingsMeter({ rate, net, income }: Props) {
  const clamped = rate === null ? 0 : Math.max(0, Math.min(1, rate))

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-ink-2">Tasa de ahorro</p>
        <p className="text-2xl font-semibold tracking-tight">
          {rate === null ? '—' : formatPct(rate).replace('+', '')}
        </p>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
        aria-label="Tasa de ahorro del periodo"
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-accent/15"
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: `${clamped * 100}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 22 }}
        />
      </div>
      <p className="mt-2.5 text-xs text-ink-3">
        {rate === null
          ? 'Sin ingresos en el periodo'
          : `Guardaste ${formatMoney(Math.max(net, 0))} de ${formatMoney(income)} ingresados`}
      </p>
    </div>
  )
}
