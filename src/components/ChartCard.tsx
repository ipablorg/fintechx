import { ChartArea, Table2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  /** Leyenda (obligatoria con ≥ 2 series; se omite con una sola). */
  legend?: ReactNode
  /** Vista de tabla accesible: el gemelo WCAG de la gráfica. */
  table: ReactNode
  children: ReactNode
}

/**
 * Región de gráfica con conmutador gráfica ⇄ tabla. La tabla garantiza que
 * ningún valor dependa solo del color o del hover.
 */
export function ChartCard({ title, subtitle, legend, table, children }: Props) {
  const [mode, setMode] = useState<'chart' | 'table'>('chart')

  const toggle = (m: 'chart' | 'table', icon: ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      aria-label={label}
      className={`grid size-8 place-items-center rounded-lg border transition-colors ${
        mode === m
          ? 'border-line bg-white/[0.07] text-ink'
          : 'border-transparent text-ink-3 hover:bg-white/[0.04] hover:text-ink-2'
      }`}
    >
      {icon}
    </button>
  )

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
        </div>
        {legend}
        <div className="flex gap-1">
          {toggle('chart', <ChartArea size={15} strokeWidth={1.8} />, 'Ver gráfica')}
          {toggle('table', <Table2 size={15} strokeWidth={1.8} />, 'Ver tabla')}
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {mode === 'chart' ? children : table}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** Chip de leyenda: el swatch imita la marca (rectángulo para barras/áreas). */
export function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-2">
      <span className="size-2.5 rounded-[3px]" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  )
}

/** Tabla gemela estándar para las gráficas. */
export function DataTable({
  caption,
  head,
  rows,
  maxHeight = 264,
}: {
  caption: string
  head: string[]
  rows: Array<Array<string>>
  maxHeight?: number
}) {
  return (
    <div className="overflow-auto rounded-xl border border-line" style={{ maxHeight }}>
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-panel-2 text-left text-xs text-ink-3">
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`px-3.5 py-2 font-medium ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((cells, r) => (
            <tr key={r} className="border-t border-line/60">
              {cells.map((c, i) => (
                <td key={i} className={`px-3.5 py-1.5 ${i > 0 ? 'text-right' : 'text-ink-2'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
