import {
  CarFront,
  Coffee,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'

import { daysAgo, TODAY, type CardCategory, type CardTxn } from '@/data/mock'
import { formatDayShort, formatMoney } from '@/lib/format'

const CATEGORY: Record<CardCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** Etiqueta del día del grupo: Hoy, Ayer o la fecha corta. */
function dayLabel(date: Date): string {
  if (sameDay(date, TODAY)) return 'Hoy'
  if (sameDay(date, daysAgo(1))) return 'Ayer'
  return formatDayShort(date)
}

type DayGroup = { key: string; label: string; items: CardTxn[] }

/** Reparte los movimientos en grupos por día, conservando el orden recibido. */
function groupByDay(txns: CardTxn[]): DayGroup[] {
  const groups: DayGroup[] = []
  const at = new Map<string, number>()

  for (const txn of txns) {
    const key = txn.date.toDateString()
    const index = at.get(key)
    if (index === undefined) {
      at.set(key, groups.length)
      groups.push({ key, label: dayLabel(txn.date), items: [txn] })
    } else {
      groups[index]!.items.push(txn)
    }
  }

  return groups
}

/** Panel agrupado de movimientos: título, buscador y filtro, filas por día. */
export function TxnList({ txns, caption }: { txns: CardTxn[]; caption: string }) {
  return (
    <section className="glass mt-4 rounded-3xl p-5" aria-label="Movimientos">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="title-section">Movimientos</h2>
          <p className="mt-0.5 truncate text-xs text-ink-3">{caption}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Buscar movimientos"
            className="glass grid size-8 cursor-pointer place-items-center rounded-full text-ink-2"
          >
            <Search size={14} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label="Filtrar movimientos"
            className="glass grid size-8 cursor-pointer place-items-center rounded-full text-ink-2"
          >
            <SlidersHorizontal size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {groupByDay(txns).map((group) => (
        <div key={group.key} className="not-first:mt-4">
          <p className="pb-1 text-[11px] tracking-wide text-ink-3 uppercase">{group.label}</p>
          <div className="divide-y divide-white/5">
            {group.items.map((txn) => (
              <TxnRow key={txn.id} txn={txn} showDate={false} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

/** Fila de movimiento: chip de categoría, comercio, meta y monto. */
export function TxnRow({ txn, showDate = true }: { txn: CardTxn; showDate?: boolean }) {
  const meta = CATEGORY[txn.category]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
        <Icon size={17} strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate headline">{txn.merchant}</p>
        {/* Agrupada por día, la fecha ya vive en la etiqueta del grupo */}
        <p className="text-xs text-ink-3">{showDate ? `${meta.label} · ${formatDayShort(txn.date)}` : meta.label}</p>
      </div>

      <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatMoney(txn.amount)}</p>
    </div>
  )
}
