import { CARDS, DAYS, PORTFOLIO_HISTORY, TODAY, type CardProduct, type HistoryPoint } from './mock'

export type BalancePoint = HistoryPoint

export type Delta = { abs: number; pct: number | null }

export const PORTFOLIO_RANGE_DAYS = 30

/** Corte del portafolio: serie diaria del rango, total actual y variación. */
export function derivePortfolio(rangeDays = PORTFOLIO_RANGE_DAYS) {
  const points = PORTFOLIO_HISTORY.slice(DAYS + 1 - rangeDays)
  const total = points[points.length - 1]?.value ?? 0
  const first = points[0]?.value ?? 0

  return {
    rangeDays,
    points,
    total,
    delta: {
      abs: total - first,
      pct: first !== 0 ? (total - first) / Math.abs(first) : null,
    } satisfies Delta,
  }
}

const MAX_CARD_TXNS = 8

/** Actividad de una tarjeta: la tarjeta, sus últimos movimientos y el gasto del mes en curso. */
export function deriveCardActivity(cardId: CardProduct['id']) {
  const card = CARDS.find((c) => c.id === cardId) ?? CARDS[0]!

  const transactions = [...card.activity].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, MAX_CARD_TXNS)

  // Redondeo único a centavos en la capa de datos: la UI solo formatea y nunca
  // muestra dos totales distintos para el mismo número.
  const spentThisMonth = Math.round(
    card.activity.reduce((acc, t) => {
      const sameMonth = t.date.getMonth() === TODAY.getMonth() && t.date.getFullYear() === TODAY.getFullYear()
      return sameMonth ? acc + Math.abs(t.amount) : acc
    }, 0) * 100,
  ) / 100

  return { card, transactions, spentThisMonth }
}
