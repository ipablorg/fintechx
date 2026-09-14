import { Bell } from 'lucide-react'
import { motion } from 'motion/react'

import { RANGE_OPTIONS, type RangeDays } from '@/data/derive'
import { TODAY } from '@/data/mock'
import { formatDateLong } from '@/lib/format'

type Props = {
  range: RangeDays
  onRange: (r: RangeDays) => void
}

/**
 * Fila de filtros del dashboard: el rango de fechas gobierna TODO lo que hay
 * debajo (saldo, métricas, gráficas y movimientos re-derivan del mismo corte).
 */
export function Header({ range, onRange }: Props) {
  const today = formatDateLong(TODAY)

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold tracking-tight">Hola, Pablo</h1>
        <p className="mt-0.5 text-sm text-ink-3 first-letter:uppercase">{today}</p>
      </div>

      <div
        role="group"
        aria-label="Rango de fechas"
        className="flex rounded-full border border-line bg-white/[0.03] p-1"
      >
        {RANGE_OPTIONS.map(({ value, label }) => {
          const selected = range === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onRange(value)}
              aria-pressed={selected}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selected ? 'text-page' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="range-thumb"
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  className="absolute inset-0 rounded-full bg-accent"
                />
              )}
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="Notificaciones"
        className="relative grid size-9 place-items-center rounded-full border border-line bg-white/[0.03] text-ink-2 transition-colors hover:text-ink"
      >
        <Bell size={16} strokeWidth={1.9} />
        <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-accent" aria-hidden="true" />
      </button>
    </header>
  )
}
