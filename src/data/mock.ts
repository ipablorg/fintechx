export type Category =
  | 'nomina'
  | 'transferencia'
  | 'super'
  | 'restaurantes'
  | 'transporte'
  | 'suscripciones'
  | 'compras'
  | 'cafe'
  | 'vivienda'

export type Txn = {
  id: string
  date: Date
  merchant: string
  category: Category
  /** Positivo = ingreso, negativo = gasto. */
  amount: number
}

export const CATEGORY_LABEL: Record<Category, string> = {
  nomina: 'Nómina',
  transferencia: 'Transferencia',
  super: 'Supermercado',
  restaurantes: 'Restaurantes',
  transporte: 'Transporte',
  suscripciones: 'Suscripciones',
  compras: 'Compras',
  cafe: 'Café',
  vivienda: 'Vivienda',
}

/** PRNG determinista (mulberry32): misma historia financiera en cada carga. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260914)

const EXPENSES: Array<{
  category: Category
  merchants: string[]
  min: number
  max: number
  weight: number
}> = [
  { category: 'super', merchants: ['La Cesta', 'MercaFresh', 'Soriana Híper'], min: 18, max: 95, weight: 3 },
  { category: 'restaurantes', merchants: ['Casa Oaxaca', 'Sushi Roll', 'Tacos El Güero'], min: 9, max: 62, weight: 3 },
  { category: 'transporte', merchants: ['Uber', 'Metro CDMX', 'Didi'], min: 2.5, max: 18, weight: 4 },
  { category: 'suscripciones', merchants: ['Spotify', 'Netflix', 'iCloud+'], min: 4.9, max: 16.9, weight: 1 },
  { category: 'compras', merchants: ['Amazon', 'Liverpool', 'Decathlon'], min: 22, max: 210, weight: 2 },
  { category: 'cafe', merchants: ['Cielito Querido', 'Starbucks', 'Café Avellaneda'], min: 2.8, max: 9.5, weight: 3 },
]

const TOTAL_WEIGHT = EXPENSES.reduce((acc, e) => acc + e.weight, 0)

function pickExpense() {
  let roll = rand() * TOTAL_WEIGHT
  for (const e of EXPENSES) {
    roll -= e.weight
    if (roll <= 0) return e
  }
  return EXPENSES[0]!
}

export const DAYS = 90

/** Ancla temporal de la demo: hoy a mediodía (evita sorpresas de DST). */
export const TODAY = (() => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d
})()

export function daysAgo(n: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d
}

function generate(): Txn[] {
  const txns: Txn[] = []
  let id = 0
  const push = (date: Date, merchant: string, category: Category, amount: number) => {
    txns.push({ id: `t${id++}`, date, merchant, category, amount: Math.round(amount * 100) / 100 })
  }

  for (let back = DAYS; back >= 0; back--) {
    const date = daysAgo(back)
    const dom = date.getDate()

    // Ingresos fijos y ocasionales
    if (dom === 1 || dom === 15) push(date, 'Nómina Loopay', 'nomina', 2480)
    if (rand() < 0.07) push(date, 'Depósito SPEI', 'transferencia', 90 + rand() * 480)

    // Gastos fijos del mes
    if (dom === 3) push(date, 'Renta depto. Roma Norte', 'vivienda', -1120)
    if (dom === 6) push(date, 'CFE Luz', 'vivienda', -(38 + rand() * 22))
    if (dom === 9) push(date, 'Telmex Internet', 'vivienda', -32.9)

    // Gasto variable: 0–3 movimientos, más los fines de semana
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const count = Math.floor(rand() * (isWeekend ? 3.6 : 2.4))
    for (let i = 0; i < count; i++) {
      const e = pickExpense()
      const merchant = e.merchants[Math.floor(rand() * e.merchants.length)]!
      push(date, merchant, e.category, -(e.min + rand() * (e.max - e.min)))
    }
  }
  return txns
}

export const TRANSACTIONS: Txn[] = generate()

const STARTING_BALANCE = 19850

/** Saldo diario: DAYS+1 puntos, del día -DAYS a hoy. */
export const BALANCE_BY_DAY: Array<{ date: Date; value: number }> = (() => {
  const perDay = new Map<number, number>()
  for (const t of TRANSACTIONS) {
    const key = t.date.toDateString()
    const hash = new Date(key).getTime()
    perDay.set(hash, (perDay.get(hash) ?? 0) + t.amount)
  }
  let balance = STARTING_BALANCE
  const points: Array<{ date: Date; value: number }> = []
  for (let back = DAYS; back >= 0; back--) {
    const date = daysAgo(back)
    balance += perDay.get(new Date(date.toDateString()).getTime()) ?? 0
    points.push({ date, value: Math.round(balance * 100) / 100 })
  }
  return points
})()
