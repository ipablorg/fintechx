import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { AmountPad, AmountView } from '@/components/AmountPad'
import { useAmountInput } from '@/lib/useAmountInput'
import { BottomSheet } from '@/components/BottomSheet'
import { SuccessCheck } from '@/components/SuccessCheck'
import { round2, assetOrFirst } from '@/data/derive'
import type { LoanOffer } from '@/data/mock'
import { formatMoney, formatRate, formatUnits } from '@/lib/format'
import { useWallet, useWalletActions } from '@/store/use-wallet'

type Step = 'monto' | 'colateral' | 'confirmar'

const LABEL: Record<Step, string> = {
  monto: 'Solicitar crédito',
  colateral: 'Garantía',
  confirmar: 'Resumen del crédito',
}

/**
 * Solicitud de crédito: monto acreditado en stablecoins, garantía que queda
 * retenida según el LTV de la oferta y resumen. Al confirmar, el crédito pasa a
 * estar activo y el saldo del activo sube con el movimiento de acreditación.
 */
export function LoanRequestSheet({ offer, onClose }: { offer: LoanOffer; onClose: () => void }) {
  const { state } = useWallet()
  const { requestCredit } = useWalletActions()
  const [step, setStep] = useState<Step>('monto')
  const [done, setDone] = useState(false)

  const collateral = assetOrFirst(state.assets, offer.collateral)
  const { amount, press, reset, value, blocked, error } = useAmountInput('0', {
    max: offer.amountUsd,
    exceedsError: `El máximo disponible es ${formatMoney(offer.amountUsd)}`,
  })

  // Garantía retenida: el monto pedido sobre el LTV de la oferta, en USD.
  // Se redondea hacia arriba a propósito: el colateral nunca puede quedar corto.
  const collateralUsd = Math.ceil((value / offer.ltv) * 100) / 100
  const monthly = round2(offer.monthlyUsd * (value / offer.amountUsd))

  const confirm = () => {
    requestCredit(offer, value, collateralUsd)
    setDone(true)
  }

  const finish = () => {
    setDone(false)
    onClose()
  }

  return (
    <>
      <BottomSheet label={LABEL[step]} onClose={onClose}>
        {step === 'monto' && (
          <>
            <AmountView
              amount={amount}
              hint={`Hasta ${formatMoney(offer.amountUsd)} en ${assetOrFirst(state.assets, offer.asset).symbol}`}
              error={error}
            />
            <div className="mt-6">
              <AmountPad onPress={press} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => reset(String(offer.amountUsd))} className="btn btn-ghost text-sm">
                Pedir el máximo
              </button>
              <button
                type="button"
                onClick={() => setStep('colateral')}
                disabled={blocked}
                data-testid="continuar-credito"
                className="btn btn-primary text-sm disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 'colateral' && (
          <>
            <h2 className="title-section">Garantía en {collateral.symbol}</h2>
            <p className="mt-1 text-sm text-ink-2">
              Queda retenida como colateral y vuelve al terminar de pagar. No se vende.
            </p>

            <div className="glass mt-4 rounded-3xl p-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full"
                  style={{ background: `color-mix(in srgb, ${collateral.color} 18%, transparent)` }}
                >
                  <img src={collateral.icon} alt="" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Garantía requerida</p>
                  <p className="text-xs text-ink-3">
                    Tienes {formatUnits(collateral.balance)} {collateral.symbol}
                  </p>
                </div>
                <p className="ml-auto shrink-0 text-sm font-semibold tabular-nums" data-testid="colateral-requerido">
                  {formatUnits(collateralUsd / collateral.priceUsd)} {collateral.symbol}
                </p>
              </div>

              <div className="mt-3 flex items-baseline justify-between text-xs text-ink-3">
                <span>LTV {formatRate(offer.ltv)}</span>
                <span className="tabular-nums">{formatMoney(collateralUsd)}</span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={Math.round(offer.ltv * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loan-to-value del colateral"
              >
                <div className="h-full rounded-full bg-white/85" style={{ width: `${offer.ltv * 100}%` }} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('monto')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button type="button" onClick={() => setStep('confirmar')} className="btn btn-primary text-sm">
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 'confirmar' && (
          <>
            <AmountView amount={amount} hint={`En ${assetOrFirst(state.assets, offer.asset).symbol}, sin comisión`} />
            <dl className="glass mt-5 divide-y divide-white/5 rounded-3xl p-4 text-sm">
              <div className="flex justify-between gap-3 pb-2">
                <dt className="text-ink-2">Garantía</dt>
                <dd className="tabular-nums">
                  {formatUnits(collateralUsd / collateral.priceUsd)} {collateral.symbol}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-ink-2">APR · plazo</dt>
                <dd className="tabular-nums">
                  {formatRate(offer.apr)} · {offer.termMonths} meses
                </dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 font-medium">
                <dt className="text-ink">Cuota mensual</dt>
                <dd className="tabular-nums">{formatMoney(monthly)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('colateral')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button type="button" onClick={confirm} data-testid="confirmar-credito" className="btn btn-primary text-sm">
                Confirmar crédito
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      <AnimatePresence>
        {done && <SuccessCheck title="Crédito acreditado" sub={`${formatMoney(value)} en ${offer.asset.toUpperCase()}`} onDone={finish} />}
      </AnimatePresence>
    </>
  )
}
