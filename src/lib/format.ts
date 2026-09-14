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

const moneySigned = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'always',
})

const numberCompact = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const pct = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
})

export function formatMoney(value: number): string {
  return money.format(value)
}

export function formatMoneySigned(value: number): string {
  return moneySigned.format(value)
}

/** Ticks de eje: compacto para miles ($26 k), entero para valores chicos. */
export function formatTick(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1000) return `${sign}$${numberCompact.format(abs)}`
  return money.format(value).replace(/[.,]00$/, '')
}

export function formatPct(value: number): string {
  return pct.format(value)
}

const dayShort = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const weekdayDay = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric' })
const monthShort = new Intl.DateTimeFormat(LOCALE, { month: 'short' })
const dateLong = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })

/** "8 sep" */
export function formatDayShort(d: Date): string {
  return dayShort.format(d)
}

/** "lun 8" */
export function formatWeekdayDay(d: Date): string {
  return weekdayDay.format(d)
}

/** "sep" */
export function formatMonthShort(d: Date): string {
  return monthShort.format(d)
}

/** "lunes, 8 de septiembre" */
export function formatDateLong(d: Date): string {
  return dateLong.format(d)
}
