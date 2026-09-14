import {
  ArrowDownLeft,
  Briefcase,
  CarFront,
  Coffee,
  House,
  ShoppingBag,
  ShoppingCart,
  Tv,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { CATEGORY_LABEL, type Category, type Txn } from '@/data/mock'
import { formatDayShort, formatMoney, formatMoneySigned } from '@/lib/format'

const ICON: Record<Category, LucideIcon> = {
  nomina: Briefcase,
  transferencia: ArrowDownLeft,
  super: ShoppingCart,
  restaurantes: UtensilsCrossed,
  transporte: CarFront,
  suscripciones: Tv,
  compras: ShoppingBag,
  cafe: Coffee,
  vivienda: House,
}

export function TransactionList({ transactions }: { transactions: Txn[] }) {
  return (
    <ul className="-mx-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {transactions.map((t, i) => {
          const Icon = ICON[t.category]
          const isIncome = t.amount >= 0
          return (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03, type: 'spring', stiffness: 320, damping: 30 } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            >
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.05] ${
                    isIncome ? 'bg-accent/10 text-accent' : 'bg-white/[0.04] text-ink-2'
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{t.merchant}</span>
                  <span className="block text-xs text-ink-3">
                    {CATEGORY_LABEL[t.category]} · {formatDayShort(t.date)}
                  </span>
                </span>
                <span className={`text-sm font-semibold tabular-nums tracking-tight ${isIncome ? 'text-up' : 'text-ink'}`}>
                  {isIncome ? formatMoneySigned(t.amount) : formatMoney(t.amount)}
                </span>
              </motion.div>
            </motion.li>
          )
        })}
      </AnimatePresence>
      {transactions.length === 0 && (
        <li className="px-2 py-8 text-center text-sm text-ink-3">Sin movimientos en este periodo.</li>
      )}
    </ul>
  )
}
