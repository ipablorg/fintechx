import bitcoinUrl from '@/assets/bitcoin.svg'
import tetherUrl from '@/assets/tether.svg'
import usdcoinUrl from '@/assets/usdcoin.svg'

/** Punto de una serie temporal de valor en USD. */
export type HistoryPoint = { date: Date; value: number }

export type Asset = {
  id: 'usdt' | 'usdc' | 'btc'
  name: string
  symbol: string
  balance: number
  usdValue: number
  change24h: number
  /** Color de la marca del activo; espejo de los tokens --color-* de @theme. */
  color: string
  icon: string
  /** Últimos 14 días de valor en USD, para la sparkline de la fila. */
  spark: number[]
}

/** Giro de un consumo con la tarjeta de crédito. */
export type CardCategory =
  | 'super'
  | 'restaurantes'
  | 'transporte'
  | 'suscripciones'
  | 'compras'
  | 'cafe'

/** Movimiento de la tarjeta de crédito. */
export type CardTxn = {
  id: string
  date: Date
  merchant: string
  category: CardCategory
  /** Siempre negativo: la tarjeta solo gasta. */
  amount: number
}

/** Tarjeta virtual tokenizada. */
export const CARD = {
  number: '4213 7712 3345 8391',
  holder: 'PABLO B.',
  expiry: '09/29',
  cvv: '842',
  last4: '8391',
  /** Límite mensual en USD. */
  limit: 4000,
} as const

export const ASSETS: Asset[] = [
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    balance: 4250.75,
    usdValue: 4250.75,
    change24h: 0.0002,
    color: '#009393',
    icon: tetherUrl,
    spark: walk(11, 4250.75, 0.0002),
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    balance: 1180.2,
    usdValue: 1180.2,
    change24h: 0.0001,
    color: '#2775ca',
    icon: usdcoinUrl,
    spark: walk(23, 1180.2, 0.0001),
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    balance: 0.0482,
    usdValue: 5731.44,
    change24h: -0.0184,
    color: '#f7931a',
    icon: bitcoinUrl,
    spark: walk(37, 5731.44, -0.0184),
  },
]

export const LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'loan-usdt-btc',
    asset: 'USDT',
    collateral: 'BTC',
    amountUsd: 5000,
    ltv: 0.65,
    apr: 0.089,
    termMonths: 12,
    monthlyUsd: 436.93,
    featured: true,
  },
  {
    id: 'loan-usdc-btc',
    asset: 'USDC',
    collateral: 'BTC',
    amountUsd: 2500,
    ltv: 0.5,
    apr: 0.074,
    termMonths: 6,
    monthlyUsd: 425.74,
  },
  {
    id: 'loan-usdt-usdc',
    asset: 'USDT',
    collateral: 'USDC',
    amountUsd: 1800,
    ltv: 0.8,
    apr: 0.102,
    termMonths: 9,
    monthlyUsd: 208.59,
  },
]

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

/** Consumos con la tarjeta: ~6 semanas de historia, del mes actual y el previo. */
export const CARD_ACTIVITY: CardTxn[] = [
  { id: 'c1', date: daysAgo(0), merchant: 'Kywik Café', category: 'cafe', amount: -4.8 },
  { id: 'c2', date: daysAgo(0), merchant: 'Uber', category: 'transporte', amount: -12.3 },
  { id: 'c3', date: daysAgo(1), merchant: 'Supermaxi', category: 'super', amount: -214.65 },
  { id: 'c4', date: daysAgo(2), merchant: 'Netflix', category: 'suscripciones', amount: -15.99 },
  { id: 'c5', date: daysAgo(3), merchant: 'De Prati', category: 'compras', amount: -1296.4 },
  { id: 'c6', date: daysAgo(5), merchant: 'Restaurante La Purita', category: 'restaurantes', amount: -64.2 },
  { id: 'c7', date: daysAgo(8), merchant: 'Novocompu', category: 'compras', amount: -432.9 },
  { id: 'c8', date: daysAgo(11), merchant: 'Mi Comisariato', category: 'super', amount: -158.75 },
  { id: 'c9', date: daysAgo(13), merchant: 'Spotify', category: 'suscripciones', amount: -11.99 },
  { id: 'c10', date: daysAgo(19), merchant: 'Cabify', category: 'transporte', amount: -18.4 },
  { id: 'c11', date: daysAgo(26), merchant: 'Fybeca', category: 'compras', amount: -76.15 },
  { id: 'c12', date: daysAgo(34), merchant: 'Sushi Vegas', category: 'restaurantes', amount: -52.6 },
]

export type LoanOffer = {
  id: string
  /** Activo que se recibe y activo que queda en garantía. */
  asset: string
  collateral: string
  amountUsd: number
  /** Loan-to-value del colateral (0–1). */
  ltv: number
  apr: number
  termMonths: number
  /** Cuota mensual estimada (amortización francesa). */
  monthlyUsd: number
  featured?: boolean
}

export const DAYS = 90

/** Valor total del portafolio en USD (suma de los activos). */
const TOTAL_USD = ASSETS.reduce((acc, a) => acc + a.usdValue, 0)

/** Serie diaria del portafolio: DAYS+1 puntos, del día -DAYS a hoy. */
export const PORTFOLIO_HISTORY: HistoryPoint[] = (() => {
  const points = walk(7, TOTAL_USD, 0.0042, DAYS + 1)
  return points.map((value, i) => ({ date: daysAgo(DAYS - i), value }))
})()

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

/**
 * Random walk determinista que termina exactamente en `end`, con deriva diaria
 * `drift` (fracción, ej. -0.018 = -1.8 %/día). Sirve sparks e historial.
 */
function walk(seed: number, end: number, drift: number, points = 14): number[] {
  const rand = mulberry32(seed)
  let value = end
  const out = [value]
  for (let i = 1; i < points; i++) {
    value = value / (1 + drift + (rand() - 0.5) * 0.016)
    out.unshift(value)
  }
  return out.map((v) => Math.round(v * 100) / 100)
}
