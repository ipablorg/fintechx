/** Locale y moneda de la app — cambia aquí y toda la UI se actualiza. */
const LOCALE = 'es-MX'
const CURRENCY = 'USD'

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
