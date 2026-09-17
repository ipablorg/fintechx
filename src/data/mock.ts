import bitcoinUrl from '@/assets/bitcoin.svg'
import tetherUrl from '@/assets/tether.svg'
import usdcoinUrl from '@/assets/usdcoin.svg'

export type AssetId = 'usdt' | 'usdc' | 'btc'

export type Asset = {
  id: AssetId
  name: string
  symbol: string
  /** Saldo en unidades del activo (no en USD). */
  balance: number
  /** Precio de referencia en USD por unidad: todo monto de la UI vive en USD. */
  priceUsd: number
  change24h: number
  /** Color de la marca del activo; espejo de los tokens --color-* de @theme. */
  color: string
  icon: string
  /** Últimos 14 días de valor en USD, para la sparkline de la fila. */
  spark: number[]
}

/** Dirección del movimiento: entra o sale dinero. */
export type TxnKind = 'ingreso' | 'gasto'

export type TxnCategory =
  | 'super'
  | 'restaurantes'
  | 'transporte'
  | 'suscripciones'
  | 'compras'
  | 'cafe'
  | 'envio'
  | 'recibido'
  | 'deposito'
  | 'retiro'
  | 'conversion'
  | 'credito'

/** Movimiento unificado del wallet: tarjeta, envíos, depósitos y créditos. */
export type Txn = {
  id: string
  date: Date
  kind: TxnKind
  /** Monto en USD con signo: negativo sale, positivo entra. */
  amount: number
  description: string
  category: TxnCategory
  asset: AssetId
  /** Tarjeta que lo originó, si el movimiento nació de un consumo con tarjeta. */
  cardId?: CardProduct['id']
}

export type CardLimit = { spent: number; total: number }

/** Red donde vive el token de la tarjeta: se muestra bajo los últimos cuatro. */
export type CardNetwork = 'Tron' | 'Ethereum'

/**
 * Tarjeta virtual tokenizada. Las tres liquidan en USDT (logo Tether + "USDT"
 * en todas las caras) y se distinguen por sus últimos cuatro y su descriptor.
 */
export type CardProduct = {
  id: 'card-principal' | 'card-ahorro' | 'card-compras'
  /** Alias corto que distingue la tarjeta dentro de la pila. */
  descriptor: 'Principal' | 'Ahorro' | 'Compras'
  network: CardNetwork
  /** Saldo disponible de la tarjeta en USDT: alimenta el frente. */
  balance: number
  number: string
  holder: string
  expiry: string
  cvv: string
  last4: string
  /** Límite mensual en USD. */
  limit: number
}

/** Contacto frecuente: foto local con iniciales y color como respaldo. */
export type Contact = {
  id: string
  name: string
  initials: string
  color: string
  /** Rostro servido desde /public; si falla la carga, Avatar cae a iniciales. */
  avatar: string
  /** Alias o dirección del contacto, visible en el detalle. */
  handle: string
}

/** Usuario de la demo: perfil de Inicio y Ajustes. */
export const USER = {
  name: 'Pablo',
  email: 'pablo@loopay.com',
  initials: 'PB',
  color: '#c00d0d',
  avatar: '/avatars/a1.jpg',
}

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

export const CONTACTS: Contact[] = [
  { id: 'c-marta', name: 'Marta Ríos', initials: 'MR', color: '#e5484d', avatar: '/avatars/a2.jpg', handle: '@marta.rios' },
  { id: 'c-diego', name: 'Diego Paredes', initials: 'DP', color: '#2775ca', avatar: '/avatars/a3.jpg', handle: 'TQd1ego…9kQ2' },
  { id: 'c-lucia', name: 'Lucía Ferrer', initials: 'LF', color: '#f7931a', avatar: '/avatars/a4.jpg', handle: '@lucia.f' },
  { id: 'c-andres', name: 'Andrés Silva', initials: 'AS', color: '#8e8e99', avatar: '/avatars/a5.jpg', handle: '0xAn4dres…f7A1' },
]

export const ASSETS: Asset[] = [
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    balance: 4250.75,
    priceUsd: 1,
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
    priceUsd: 1,
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
    priceUsd: 118908.5,
    change24h: -0.0184,
    color: '#f7931a',
    icon: bitcoinUrl,
    spark: walk(37, 5731.44, -0.0184),
  },
]

/** Direcciones de recepción mock, una por red. */
export const RECEIVE_ADDRESSES: Record<CardNetwork, string> = {
  Tron: 'TQ5nrRz8yb3s1hP3jJ7vE9kQ2wLmX4cDaB',
  Ethereum: '0x9f4B8a2C7d1E6f3A5b0C8d7E2f1A4c6B9d3E5f7A',
}

/** Cuenta bancaria mock para retiros y depósitos por transferencia. */
export const BANK_ACCOUNT = { bank: 'Banco Amazonas', alias: 'pablo.loopay', last4: '4821' }

/** Contenido real del canal de soporte, compartido por Bienvenida y Más. */
export const SUPPORT = {
  email: 'ayuda@loopay.com',
  phone: '+593 99 123 4567',
  hours: 'Lunes a sábado, 8:00–20:00 (ECT)',
}

export type Notif = {
  id: string
  title: string
  body: string
  date: Date
  read: boolean
}

export const NOTIFS: Notif[] = [
  {
    id: 'n1',
    title: 'Depósito acreditado',
    body: 'Recibiste $1,200.00 en USDT desde Banco Amazonas.',
    date: daysAgo(1),
    read: false,
  },
  {
    id: 'n2',
    title: 'Crédito preaprobado',
    body: 'Tienes hasta $5,000 con garantía BTC al 65% de LTV.',
    date: daysAgo(2),
    read: false,
  },
  {
    id: 'n3',
    title: 'Nuevo dispositivo',
    body: 'Iniciaste sesión desde un iPhone reconocido.',
    date: daysAgo(4),
    read: true,
  },
  {
    id: 'n4',
    title: 'Consumo con tarjeta',
    body: 'De Prati por $1,296.40 con la tarjeta Principal.',
    date: daysAgo(3),
    read: false,
  },
]

export type LoanOffer = {
  id: string
  /** Activo que se recibe y activo que queda en garantía. */
  asset: AssetId
  collateral: AssetId
  amountUsd: number
  /** Loan-to-value del colateral (0–1). */
  ltv: number
  apr: number
  termMonths: number
  /** Cuota mensual estimada (amortización francesa). */
  monthlyUsd: number
  featured?: boolean
}

export const LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'loan-usdt-btc',
    asset: 'usdt',
    collateral: 'btc',
    amountUsd: 5000,
    ltv: 0.65,
    apr: 0.089,
    termMonths: 12,
    monthlyUsd: 436.93,
    featured: true,
  },
  {
    id: 'loan-usdc-btc',
    asset: 'usdc',
    collateral: 'btc',
    amountUsd: 2500,
    ltv: 0.5,
    apr: 0.074,
    termMonths: 6,
    monthlyUsd: 425.74,
  },
  {
    id: 'loan-usdt-usdc',
    asset: 'usdt',
    collateral: 'usdc',
    amountUsd: 1800,
    ltv: 0.8,
    apr: 0.102,
    termMonths: 9,
    monthlyUsd: 208.59,
  },
]

/** Crédito activo: nace de una solicitud confirmada y vive en el store. */
export type ActiveLoan = {
  id: string
  asset: AssetId
  collateral: AssetId
  amountUsd: number
  collateralUsd: number
  ltv: number
  apr: number
  termMonths: number
  monthlyUsd: number
  date: Date
}

export type Prefs = {
  hideBalances: boolean
  biometrics: boolean
  notifications: boolean
}

/** Tarjetas tokenizadas del usuario: todas USDT, cada una con su propia historia. */
export const CARDS: CardProduct[] = [
  {
    id: 'card-principal',
    descriptor: 'Principal',
    network: 'Tron',
    balance: 2740.5,
    number: '4213 7712 3345 8391',
    holder: 'PABLO B.',
    expiry: '09/29',
    cvv: '842',
    last4: '8391',
    limit: 4000,
  },
  {
    id: 'card-ahorro',
    descriptor: 'Ahorro',
    network: 'Ethereum',
    balance: 1185.25,
    number: '5187 9042 6613 2204',
    holder: 'PABLO B.',
    expiry: '04/28',
    cvv: '317',
    last4: '2204',
    limit: 2500,
  },
  {
    id: 'card-compras',
    descriptor: 'Compras',
    network: 'Tron',
    balance: 890.1,
    number: '6042 1187 5590 4476',
    holder: 'PABLO B.',
    expiry: '11/27',
    cvv: '908',
    last4: '4476',
    limit: 6000,
  },
]

/** Historial de consumo por tarjeta, en el orden en que se cargaba antes. */
const CARD_ACTIVITY: Array<{ card: CardProduct['id']; items: Array<[number, string, TxnCategory, number]> }> = [
  {
    card: 'card-principal',
    items: [
      [0, 'Kywik Café', 'cafe', -4.8],
      [0, 'Uber', 'transporte', -12.3],
      [1, 'Supermaxi', 'super', -214.65],
      [2, 'Netflix', 'suscripciones', -15.99],
      [3, 'De Prati', 'compras', -1296.4],
      [5, 'Restaurante La Purita', 'restaurantes', -64.2],
      [8, 'Novocompu', 'compras', -432.9],
      [11, 'Mi Comisariato', 'super', -158.75],
      [13, 'Spotify', 'suscripciones', -11.99],
      [19, 'Cabify', 'transporte', -18.4],
      [26, 'Fybeca', 'compras', -76.15],
      [34, 'Sushi Vegas', 'restaurantes', -52.6],
    ],
  },
  {
    card: 'card-ahorro',
    items: [
      [0, 'Kywik Café', 'cafe', -6.2],
      [1, 'Tienda Mitsubishi', 'super', -96.4],
      [3, 'iCloud+', 'suscripciones', -2.99],
      [5, 'Pimiento', 'restaurantes', -38.75],
      [7, 'Cabify', 'transporte', -14.1],
      [10, 'Sukasa', 'compras', -689.9],
      [13, 'Supermaxi', 'super', -212.3],
      [20, 'Habibi Café', 'cafe', -8.4],
      [29, 'Casa Taller', 'restaurantes', -46.5],
    ],
  },
  {
    card: 'card-compras',
    items: [
      [2, 'De Prati', 'compras', -1240.5],
      [4, 'Sushi Vegas', 'restaurantes', -98.4],
      [9, 'Mi Comisariato', 'super', -318.25],
      [12, 'Apple Store', 'compras', -2480],
      [13, 'Kywik Café', 'cafe', -9.6],
      [18, 'Cabify', 'transporte', -22.6],
      [24, 'Netflix', 'suscripciones', -15.99],
    ],
  },
]

/** Semilla de movimientos: consumos por tarjeta + ingresos del wallet. */
export const SEED_TXNS: Txn[] = [
  ...CARD_ACTIVITY.flatMap(({ card, items }) =>
    items.map(([days, merchant, category, amount], i) => ({
      id: `${card}-${i}`,
      date: daysAgo(days),
      kind: 'gasto' as const,
      amount,
      description: merchant,
      category,
      asset: 'usdt' as const,
      cardId: card,
    })),
  ),
  { id: 'w1', date: daysAgo(1), kind: 'ingreso', amount: 1200, description: 'Depósito recibido', category: 'deposito', asset: 'usdt' },
  { id: 'w2', date: daysAgo(4), kind: 'ingreso', amount: 350, description: 'Lucía Ferrer te envió', category: 'recibido', asset: 'usdt' },
  { id: 'w3', date: daysAgo(6), kind: 'gasto', amount: 850, description: 'Compra de Bitcoin', category: 'conversion', asset: 'btc' },
  { id: 'w4', date: daysAgo(12), kind: 'gasto', amount: 200, description: 'Retiro a cuenta bancaria', category: 'retiro', asset: 'usdt' },
]

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
