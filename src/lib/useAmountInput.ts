import { useState } from 'react'

import type { NumKey } from '@/components/AmountPad'

/** Copys únicos de validación: los cinco flujos de monto dicen lo mismo. */
export const AMOUNT_ERROR_ZERO = 'Ingresa un monto mayor a $0'
export const AMOUNT_ERROR_EXCEEDS = 'Saldo insuficiente'

/**
 * Estado del monto tecleado: string con dos decimales como máximo y un solo
 * punto. Compartido por Enviar, Depositar, Retirar, Convertir y Créditos.
 *
 * Con `max` (saldo disponible o tope de la oferta) deriva también la validez —
 * `exceeds`, `blocked` y el copy de error—, de modo que ningún flujo repite la
 * terna `value/invalid/exceeds` por su cuenta.
 */
export function useAmountInput(initial = '0', opts: { max?: number; exceedsError?: string } = {}) {
  const [amount, setAmount] = useState(initial)

  const press = (key: NumKey) =>
    setAmount((prev) => {
      if (key === 'del') return prev.length <= 1 ? '0' : prev.slice(0, -1)
      if (key === '.') return prev.includes('.') ? prev : `${prev}.`
      const next = prev === '0' ? key : prev + key
      const decimals = next.split('.')[1]
      return decimals && decimals.length > 2 ? prev : next
    })

  const reset = (value = '0') => setAmount(value)

  const value = Number(amount) || 0
  const invalid = value <= 0
  const exceeds = opts.max !== undefined && value > opts.max
  const error = exceeds ? (opts.exceedsError ?? AMOUNT_ERROR_EXCEEDS) : invalid ? AMOUNT_ERROR_ZERO : null

  return { amount, press, reset, value, invalid, exceeds, blocked: invalid || exceeds, error }
}
