import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CarFront,
  ChevronRight,
  Coffee,
  HandCoins,
  Landmark,
  Search,
  Send,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { daysAgo, TODAY, type Txn, type TxnCategory, type TxnKind } from '@/data/mock'
import { formatDayShort, formatMoney } from '@/lib/format'

const CATEGORY: Record<TxnCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
  envio: { label: 'Envío', icon: Send },
  recibido: { label: 'Recibido', icon: ArrowDownLeft },
  deposito: { label: 'Depósito', icon: Landmark },
  retiro: { label: 'Retiro', icon: ArrowUpRight },
  conversion: { label: 'Conversión', icon: ArrowLeftRight },
  credito: { label: 'Crédito', icon: HandCoins },
}

type Filter = 'todos' | TxnKind

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'ingreso', label: 'Ingresos' },
  { id: 'gasto', label: 'Gastos' },
]

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** Etiqueta del día del grupo: Hoy, Ayer o la fecha corta. */
function dayLabel(date: Date): string {
  if (sameDay(date, TODAY)) return 'Hoy'
  if (sameDay(date, daysAgo(1))) return 'Ayer'
  return formatDayShort(date)
}

type DayGroup = { key: string; label: string; items: Txn[] }

/** Reparte los movimientos en grupos por día, conservando el orden recibido. */
function groupByDay(txns: Txn[]): DayGroup[] {
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

/** Fila de movimiento: chip de categoría, descripción, meta y monto con signo. */
export function TxnRow({ txn, showDate = true }: { txn: Txn; showDate?: boolean }) {
  const meta = CATEGORY[txn.category]
  const Icon = meta.icon
  const income = txn.kind === 'ingreso'

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
        <Icon size={17} strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate headline">{txn.description}</p>
        {/* Agrupada por día, la fecha ya vive en la etiqueta del grupo */}
        <p className="text-xs text-ink-3">{showDate ? `${meta.label} · ${formatDayShort(txn.date)}` : meta.label}</p>
      </div>

      <p className={`shrink-0 text-sm font-medium tabular-nums ${income ? 'text-up' : 'text-ink'}`}>
        {income ? '+' : ''}
        {formatMoney(txn.amount)}
      </p>
    </div>
  )
}

/**
 * Panel de movimientos del wallet: búsqueda por texto y filtro por dirección,
 * ambos funcionales sobre la lista que recibe. Opcionalmente enlaza al
 * historial completo.
 */
export function TxnList({
  txns,
  caption,
  onViewAll,
  title = 'Movimientos',
}: {
  txns: Txn[]
  caption: string
  onViewAll?: () => void
  title?: string
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [searchOpen, setSearchOpen] = useState(false)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return txns.filter((t) => {
      if (filter !== 'todos' && t.kind !== filter) return false
      if (!q) return true
      const hay = `${t.description} ${CATEGORY[t.category].label}`.toLowerCase()
      return hay.includes(q)
    })
  }, [txns, query, filter])

  return (
    <section className="glass mt-4 rounded-3xl p-5" aria-label="Movimientos">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="title-section">{title}</h2>
          <p className="mt-0.5 truncate text-xs text-ink-3">{caption}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar movimientos'}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((o) => !o)
              if (searchOpen) setQuery('')
            }}
            className={`glass grid size-8 cursor-pointer place-items-center rounded-full transition-colors ${
              searchOpen ? 'text-ink' : 'text-ink-2'
            }`}
          >
            <Search size={14} strokeWidth={1.6} />
          </button>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="glass flex cursor-pointer items-center gap-0.5 rounded-full py-1.5 pr-2 pl-3 text-xs text-ink-2 transition-colors hover:text-ink"
            >
              Ver todo
              <ChevronRight size={13} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda funcional: filtra descripción y categoría sobre la lista dada */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass flex items-center gap-2 rounded-full px-3 py-2">
              <Search size={14} strokeWidth={1.6} className="shrink-0 text-ink-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar movimientos"
                aria-label="Buscar movimientos"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtro por dirección del movimiento */}
      <div className="mt-3 flex items-center gap-1.5" aria-label="Filtrar movimientos">
        <SlidersHorizontal size={13} strokeWidth={1.6} className="mr-1 shrink-0 text-ink-3" />
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              filter === id ? 'border-white bg-white text-black' : 'border-line bg-panel-2/60 text-ink-2 hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-3">Sin movimientos para esta búsqueda</p>
      ) : (
        groupByDay(visible).map((group) => (
          <div key={group.key} className="not-first:mt-4">
            <p className="pb-1 text-[11px] tracking-wide text-ink-3 uppercase">{group.label}</p>
            <div className="divide-y divide-white/5">
              {group.items.map((txn) => (
                <TxnRow key={txn.id} txn={txn} showDate={false} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
