import { TODAY, type Asset, type CardProduct, type Txn } from './mock'

const MAX_CARD_TXNS = 8

/** Comparador fecha descendente: lo más nuevo primero (movimientos y avisos). */
export const byDateDesc = (a: { date: Date }, b: { date: Date }) => b.date.getTime() - a.date.getTime()

/** Dinero siempre redondeado a centavos en la capa de datos: la UI solo formatea. */
export const round2 = (n: number) => Math.round(n * 100) / 100

/** Valor en USD de un activo: unidades por precio de referencia. */
export const assetUsd = (a: Asset) => round2(a.balance * a.priceUsd)

/**
 * Activo por id: la semilla siempre contiene los tres, así que nunca falta.
 * El nombre lo dice —si no está, vuelve el primero—: es un garantía de la
 * semilla, no una búsqueda que pueda fallar en silencio.
 */
export const assetOrFirst = (assets: Asset[], id: Asset['id']): Asset => assets.find((a) => a.id === id) ?? assets[0]!

/** Portafolio total en USD: la suma del valor de todos los activos. */
export function totalPortfolioUsd(assets: Asset[]) {
  return round2(assets.reduce((acc, a) => acc + assetUsd(a), 0))
}

/** Actividad de una tarjeta: sus movimientos y el gasto del mes en curso. */
export function deriveCardActivity(txns: Txn[], cardId: CardProduct['id']) {
  const cardTxns = txns.filter((t) => t.cardId === cardId)

  const transactions = [...cardTxns].sort(byDateDesc).slice(0, MAX_CARD_TXNS)

  // Redondeo único a centavos en la capa de datos: la UI solo formatea y nunca
  // muestra dos totales distintos para el mismo número.
  const spentThisMonth = round2(
    cardTxns.reduce((acc, t) => {
      const sameMonth = t.date.getMonth() === TODAY.getMonth() && t.date.getFullYear() === TODAY.getFullYear()
      return sameMonth ? acc + Math.abs(t.amount) : acc
    }, 0),
  )

  return { transactions, spentThisMonth }
}
