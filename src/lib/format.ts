/** Locale y moneda de la app — cambia aquí y toda la UI se actualiza. */
const LOCALE = 'es-MX'
const CURRENCY = 'USD'

/** Saldo tapado por la preferencia de privacidad: una sola cadena en toda la app. */
export const MASKED_AMOUNT = '$••••••'

/**
 * Escala única de montos gigantes: md en las hojas, lg en pantallas completas.
 * El saldo de Inicio y el monto de cada flujo comparten esta tipografía.
 */
export const AMOUNT_TEXT = {
  md: 'text-[42px] leading-none font-bold tracking-[-0.03em] tabular-nums',
  lg: 'text-[46px] leading-none font-bold tracking-[-0.03em] tabular-nums',
} as const

export type AmountSize = keyof typeof AMOUNT_TEXT

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const units = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

const pct = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
})

const rate = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatMoney(value: number): string {
  return money.format(value)
}

/** Monto partido para el bloque de saldo: parte entera y centavos con su separador. */
export function formatMoneyParts(value: number): { whole: string; cents: string } {
  const parts = money.formatToParts(value)
  const cut = parts.findIndex((p) => p.type === 'decimal')
  if (cut < 0) return { whole: money.format(value), cents: '' }
  return {
    whole: parts.slice(0, cut).map((p) => p.value).join(''),
    cents: parts.slice(cut).map((p) => p.value).join(''),
  }
}

/** Cantidad en unidades del activo (USDT, USDC, BTC…), sin símbolo de moneda. */
export function formatUnits(value: number): string {
  return units.format(value)
}

export function formatPct(value: number): string {
  return pct.format(value)
}

/** Porcentaje sin signo (LTV, APR, uso del límite). */
export function formatRate(value: number): string {
  return rate.format(value)
}

const dayShort = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })

/** "8 sep" */
export function formatDayShort(d: Date): string {
  return dayShort.format(d)
}
