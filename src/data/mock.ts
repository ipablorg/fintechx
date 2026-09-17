import bitcoinUrl from '@/assets/bitcoin.svg'
import tetherUrl from '@/assets/tether.svg'
import usdcoinUrl from '@/assets/usdcoin.svg'

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

/** Consumo y tope del mes en curso: alimenta el reverso de la tarjeta. */
export type CardLimit = { spent: number; total: number }

/**
 * Tarjeta virtual tokenizada. Las tres liquidan en USDT (logo Tether + "USDT"
 * en todas las caras) y se distinguen por sus últimos cuatro y su descriptor.
 */
export type CardProduct = {
  id: 'card-principal' | 'card-ahorro' | 'card-compras'
  /** Alias corto que distingue la tarjeta dentro de la pila. */
  descriptor: 'Principal' | 'Ahorro' | 'Compras'
  number: string
  holder: string
  expiry: string
  cvv: string
  last4: string
  /** Límite mensual en USD. */
  limit: number
  activity: CardTxn[]
}

/** Contacto frecuente: foto local con iniciales y color como respaldo. */
export type Contact = {
  id: string
  name: string
  initials: string
  color: string
  /** Rostro servido desde /public; si falla la carga, Avatar cae a iniciales. */
  avatar: string
}

/** Fuente única de contactos: acciones rápidas de Inicio y Enviar dinero. */
export const CONTACTS: Contact[] = [
  { id: 'c-marta', name: 'Marta Ríos', initials: 'MR', color: '#e5484d', avatar: '/avatars/a2.jpg' },
  { id: 'c-diego', name: 'Diego Paredes', initials: 'DP', color: '#2775ca', avatar: '/avatars/a3.jpg' },
  { id: 'c-lucia', name: 'Lucía Ferrer', initials: 'LF', color: '#f7931a', avatar: '/avatars/a4.jpg' },
  { id: 'c-andres', name: 'Andrés Silva', initials: 'AS', color: '#8e8e99', avatar: '/avatars/a5.jpg' },
]

/** Usuario de la demo: perfil de Inicio y Ajustes. */
export const USER = {
  name: 'Pablo',
  email: 'pablo@loopay.com',
  initials: 'PB',
  color: '#c00d0d',
  avatar: '/avatars/a1.jpg',
}

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

/** Tarjetas tokenizadas del usuario: todas USDT, cada una con su propia historia. */
export const CARDS: CardProduct[] = [
  {
    id: 'card-principal',
    descriptor: 'Principal',
    number: '4213 7712 3345 8391',
    holder: 'PABLO B.',
    expiry: '09/29',
    cvv: '842',
    last4: '8391',
    limit: 4000,
    activity: [
      { id: 'u1', date: daysAgo(0), merchant: 'Kywik Café', category: 'cafe', amount: -4.8 },
      { id: 'u2', date: daysAgo(0), merchant: 'Uber', category: 'transporte', amount: -12.3 },
      { id: 'u3', date: daysAgo(1), merchant: 'Supermaxi', category: 'super', amount: -214.65 },
      { id: 'u4', date: daysAgo(2), merchant: 'Netflix', category: 'suscripciones', amount: -15.99 },
      { id: 'u5', date: daysAgo(3), merchant: 'De Prati', category: 'compras', amount: -1296.4 },
      { id: 'u6', date: daysAgo(5), merchant: 'Restaurante La Purita', category: 'restaurantes', amount: -64.2 },
      { id: 'u7', date: daysAgo(8), merchant: 'Novocompu', category: 'compras', amount: -432.9 },
      { id: 'u8', date: daysAgo(11), merchant: 'Mi Comisariato', category: 'super', amount: -158.75 },
      { id: 'u9', date: daysAgo(13), merchant: 'Spotify', category: 'suscripciones', amount: -11.99 },
      { id: 'u10', date: daysAgo(19), merchant: 'Cabify', category: 'transporte', amount: -18.4 },
      { id: 'u11', date: daysAgo(26), merchant: 'Fybeca', category: 'compras', amount: -76.15 },
      { id: 'u12', date: daysAgo(34), merchant: 'Sushi Vegas', category: 'restaurantes', amount: -52.6 },
    ],
  },
  {
    id: 'card-ahorro',
    descriptor: 'Ahorro',
    number: '5187 9042 6613 2204',
    holder: 'PABLO B.',
    expiry: '04/28',
    cvv: '317',
    last4: '2204',
    limit: 2500,
    activity: [
      { id: 'd1', date: daysAgo(0), merchant: 'Kywik Café', category: 'cafe', amount: -6.2 },
      { id: 'd2', date: daysAgo(1), merchant: 'Tienda Mitsubishi', category: 'super', amount: -96.4 },
      { id: 'd3', date: daysAgo(3), merchant: 'iCloud+', category: 'suscripciones', amount: -2.99 },
      { id: 'd4', date: daysAgo(5), merchant: 'Pimiento', category: 'restaurantes', amount: -38.75 },
      { id: 'd5', date: daysAgo(7), merchant: 'Cabify', category: 'transporte', amount: -14.1 },
      { id: 'd6', date: daysAgo(10), merchant: 'Sukasa', category: 'compras', amount: -689.9 },
      { id: 'd7', date: daysAgo(13), merchant: 'Supermaxi', category: 'super', amount: -212.3 },
      { id: 'd8', date: daysAgo(20), merchant: 'Habibi Café', category: 'cafe', amount: -8.4 },
      { id: 'd9', date: daysAgo(29), merchant: 'Casa Taller', category: 'restaurantes', amount: -46.5 },
    ],
  },
  {
    id: 'card-compras',
    descriptor: 'Compras',
    number: '6042 1187 5590 4476',
    holder: 'PABLO B.',
    expiry: '11/27',
    cvv: '908',
    last4: '4476',
    limit: 6000,
    activity: [
      { id: 'b1', date: daysAgo(2), merchant: 'De Prati', category: 'compras', amount: -1240.5 },
      { id: 'b2', date: daysAgo(4), merchant: 'Sushi Vegas', category: 'restaurantes', amount: -98.4 },
      { id: 'b3', date: daysAgo(9), merchant: 'Mi Comisariato', category: 'super', amount: -318.25 },
      { id: 'b4', date: daysAgo(12), merchant: 'Apple Store', category: 'compras', amount: -2480 },
      { id: 'b5', date: daysAgo(13), merchant: 'Kywik Café', category: 'cafe', amount: -9.6 },
      { id: 'b6', date: daysAgo(18), merchant: 'Cabify', category: 'transporte', amount: -22.6 },
      { id: 'b7', date: daysAgo(24), merchant: 'Netflix', category: 'suscripciones', amount: -15.99 },
    ],
  },
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
 * `drift` (fracción, ej. -0.018 = -1.8 %/día). Sirve las sparklines de fila.
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
