import { ASSETS, CARDS, TODAY, type CardProduct, type CardTxn } from './mock'

const MAX_CARD_TXNS = 8

/** Comparador fecha descendente: el movimiento más nuevo primero. */
export const byDateDesc = (a: CardTxn, b: CardTxn) => b.date.getTime() - a.date.getTime()

/** Portafolio total en USD: la suma del valor de todos los activos. */
export function totalPortfolioUsd() {
  return ASSETS.reduce((acc, a) => acc + a.usdValue, 0)
}

/** Actividad de una tarjeta: la tarjeta, sus últimos movimientos y el gasto del mes en curso. */
export function deriveCardActivity(cardId: CardProduct['id']) {
  const card = CARDS.find((c) => c.id === cardId) ?? CARDS[0]!

  const transactions = [...card.activity].sort(byDateDesc).slice(0, MAX_CARD_TXNS)

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
