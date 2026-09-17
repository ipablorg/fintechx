import {
  CarFront,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Tv,
  Utensils,
  type LucideIcon,
} from 'lucide-react'

import { type CardCategory, type CardTxn } from '@/data/mock'
import { formatDayShort, formatMoney } from '@/lib/format'

const CATEGORY: Record<CardCategory, { label: string; icon: LucideIcon }> = {
  super: { label: 'Supermercado', icon: ShoppingCart },
  restaurantes: { label: 'Restaurantes', icon: Utensils },
  transporte: { label: 'Transporte', icon: CarFront },
  suscripciones: { label: 'Suscripciones', icon: Tv },
  compras: { label: 'Compras', icon: ShoppingBag },
  cafe: { label: 'Café', icon: Coffee },
}

/** Panel agrupado de movimientos: título, meta y filas. */
export function TxnList({ txns, caption }: { txns: CardTxn[]; caption: string }) {
  return (
    <section className="glass mt-4 rounded-3xl p-5" aria-label="Movimientos">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="title-section">Movimientos</h2>
        <span className="text-xs text-ink-3">{caption}</span>
      </div>

      <div className="divide-y divide-white/5">
        {txns.map((txn) => (
          <TxnRow key={txn.id} txn={txn} />
        ))}
      </div>
    </section>
  )
}

/** Fila de movimiento: chip de categoría, comercio, meta y monto. */
export function TxnRow({ txn }: { txn: CardTxn }) {
  const meta = CATEGORY[txn.category]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
        <Icon size={17} strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate headline">{txn.merchant}</p>
        <p className="text-xs text-ink-3">
          {meta.label} · {formatDayShort(txn.date)}
        </p>
      </div>

      <p className="shrink-0 text-sm font-medium text-ink tabular-nums">{formatMoney(txn.amount)}</p>
    </div>
  )
}
