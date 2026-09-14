import { formatDayShort, formatMonthShort, formatWeekdayDay } from '@/lib/format'
import { BALANCE_BY_DAY, DAYS, daysAgo, TRANSACTIONS, type Txn } from './mock'

export type RangeDays = 7 | 30 | 90

export const RANGE_OPTIONS: Array<{ value: RangeDays; label: string }> = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 90, label: '90D' },
]

export type BalancePoint = { date: Date; value: number }
export type Bucket = {
  key: string
  label: string
  /** Etiqueta extendida para el tooltip ("Semana del 18 ago"). */
  long: string
  income: number
  expense: number
}

export type Delta = { abs: number; pct: number | null }

export type Dashboard = {
  range: RangeDays
  /** Serie diaria de saldo dentro del rango (range+1 puntos). */
  balance: BalancePoint[]
  current: number
  /** Variación del saldo contra el inicio del rango. */
  balanceDelta: Delta
  income: number
  expense: number
  net: number
  /** Variaciones contra la ventana anterior del mismo tamaño. */
  incomeDelta: Delta
  expenseDelta: Delta
  /** Tasa de ahorro del rango: net / income (null si no hubo ingresos). */
  savingsRate: number | null
  incomeSpark: number[]
  expenseSpark: number[]
  /** Flujo de caja con granularidad adaptativa: día / semana / mes. */
  buckets: Bucket[]
  /** Últimos movimientos dentro del rango, más recientes primero. */
  transactions: Txn[]
}

function delta(current: number, previous: number): Delta {
  return {
    abs: current - previous,
    pct: previous !== 0 ? (current - previous) / Math.abs(previous) : null,
  }
}

function sums(txns: Txn[]): { income: number; expense: number } {
  let income = 0
  let expense = 0
  for (const t of txns) {
    if (t.amount >= 0) income += t.amount
    else expense += -t.amount
  }
  return { income, expense }
}

function inWindow(txns: Txn[], fromDaysAgo: number, toDaysAgo: number): Txn[] {
  const from = daysAgo(fromDaysAgo)
  from.setHours(0, 0, 0, 0)
  const to = daysAgo(toDaysAgo)
  to.setHours(23, 59, 59, 999)
  return txns.filter((t) => t.date >= from && t.date <= to)
}

/** Lunes de la semana de `d` (semana europea/latam). */
function mondayOf(d: Date): Date {
  const out = new Date(d)
  const shift = (out.getDay() + 6) % 7
  out.setDate(out.getDate() - shift)
  out.setHours(12, 0, 0, 0)
  return out
}

function bucketize(txns: Txn[], range: RangeDays): Bucket[] {
  const map = new Map<string, Bucket>()
  const ensure = (key: string, label: string, long: string): Bucket => {
    let b = map.get(key)
    if (!b) {
      b = { key, label, long, income: 0, expense: 0 }
      map.set(key, b)
    }
    return b
  }

  // Pre-crea los buckets en orden cronológico para que los vacíos también existan.
  if (range === 7) {
    for (let back = 6; back >= 0; back--) {
      const d = daysAgo(back)
      ensure(d.toDateString(), formatWeekdayDay(d), formatDayShort(d))
    }
  } else if (range === 30) {
    const seen = new Set<string>()
    for (let back = 29; back >= 0; back--) {
      const monday = mondayOf(daysAgo(back))
      const key = monday.toDateString()
      if (!seen.has(key)) {
        seen.add(key)
        const label = formatDayShort(monday)
        ensure(key, label, `Semana del ${label}`)
      }
    }
  } else {
    const seen = new Set<string>()
    for (let back = 89; back >= 0; back--) {
      const d = daysAgo(back)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!seen.has(key)) {
        seen.add(key)
        const label = formatMonthShort(d)
        ensure(key, label, label)
      }
    }
  }

  for (const t of txns) {
    let key: string
    if (range === 7) key = t.date.toDateString()
    else if (range === 30) key = mondayOf(t.date).toDateString()
    else key = `${t.date.getFullYear()}-${t.date.getMonth()}`
    const bucket = map.get(key)
    if (!bucket) continue
    if (t.amount >= 0) bucket.income += t.amount
    else bucket.expense += -t.amount
  }
  return [...map.values()]
}

function sparkline(txns: Txn[], range: RangeDays, kind: 'income' | 'expense'): number[] {
  const points = Math.min(12, range)
  const daysPerPoint = range / points
  const out = new Array<number>(points).fill(0)
  const start = daysAgo(range - 1)
  start.setHours(0, 0, 0, 0)
  for (const t of txns) {
    const idx = Math.min(points - 1, Math.floor((t.date.getTime() - start.getTime()) / 86400000 / daysPerPoint))
    if (idx < 0) continue
    if (kind === 'income' && t.amount >= 0) out[idx] = (out[idx] ?? 0) + t.amount
    if (kind === 'expense' && t.amount < 0) out[idx] = (out[idx] ?? 0) + -t.amount
  }
  return out
}

export function deriveDashboard(range: RangeDays): Dashboard {
  const balance = BALANCE_BY_DAY.slice(DAYS - range)
  const current = balance[balance.length - 1]?.value ?? 0
  const first = balance[0]?.value ?? 0

  const rangeTxns = inWindow(TRANSACTIONS, range - 1, 0)
  const prevTxns = inWindow(TRANSACTIONS, range * 2 - 1, range)

  const cur = sums(rangeTxns)
  const prev = sums(prevTxns)
  const net = cur.income - cur.expense
  // Solo comparamos contra la ventana anterior si los datos la cubren completa;
  // una ventana parcial produciría porcentajes absurdos.
  const hasPrev = range * 2 - 1 <= DAYS
  const NO_DELTA: Delta = { abs: 0, pct: null }

  return {
    range,
    balance,
    current,
    balanceDelta: delta(current, first),
    income: cur.income,
    expense: cur.expense,
    net,
    incomeDelta: hasPrev ? delta(cur.income, prev.income) : NO_DELTA,
    expenseDelta: hasPrev ? delta(cur.expense, prev.expense) : NO_DELTA,
    savingsRate: cur.income > 0 ? net / cur.income : null,
    incomeSpark: sparkline(rangeTxns, range, 'income'),
    expenseSpark: sparkline(rangeTxns, range, 'expense'),
    buckets: bucketize(rangeTxns, range),
    transactions: [...rangeTxns].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 9),
  }
}
