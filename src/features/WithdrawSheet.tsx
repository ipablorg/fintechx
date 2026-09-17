import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { AmountPad, AmountView } from '@/components/AmountPad'
import { useAmountInput } from '@/lib/useAmountInput'
import { BottomSheet } from '@/components/BottomSheet'
import { SuccessCheck } from '@/components/SuccessCheck'
import { assetUsd, assetOrFirst } from '@/data/derive'
import { BANK_ACCOUNT, RECEIVE_ADDRESSES } from '@/data/mock'
import { formatMoney } from '@/lib/format'
import { useWallet, useWalletActions } from '@/store/use-wallet'

type Dest = 'banco' | 'cripto'
type Step = 'destino' | 'monto' | 'confirmar'

const LABEL: Record<Step, string> = {
  destino: 'Retirar',
  monto: 'Monto del retiro',
  confirmar: 'Confirmar retiro',
}

const DESTS: Array<{ id: Dest; title: string; sub: string }> = [
  { id: 'banco', title: 'Cuenta bancaria', sub: `${BANK_ACCOUNT.bank} · ••${BANK_ACCOUNT.last4}` },
  { id: 'cripto', title: 'Dirección cripto', sub: 'USDT TRC-20 en tu wallet externo' },
]

/**
 * Retirar: destino, monto validado contra el saldo de USDT (error claro si
 * excede) y confirmación con desglose. Al confirmar el saldo baja.
 */
export function WithdrawSheet({ onClose }: { onClose: () => void }) {
  const { state } = useWallet()
  const { withdraw } = useWalletActions()
  const [step, setStep] = useState<Step>('destino')
  const [dest, setDest] = useState<Dest>('banco')
  const [done, setDone] = useState(false)
  const usdt = assetOrFirst(state.assets, 'usdt')
  const available = assetUsd(usdt)
  const { amount, press, value, blocked, error } = useAmountInput('0', { max: available })

  const confirm = () => {
    withdraw(dest, value)
    setDone(true)
  }

  const finish = () => {
    setDone(false)
    onClose()
  }

  return (
    <>
      <BottomSheet label={LABEL[step]} onClose={onClose}>
        {step === 'destino' && (
          <>
            <h2 className="title-section">¿A dónde retiramos?</h2>
            <ul className="mt-4 grid gap-2">
              {DESTS.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setDest(d.id)
                      setStep('monto')
                    }}
                    className="glass flex w-full cursor-pointer flex-col gap-1 rounded-3xl p-4 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{d.title}</span>
                    <span className="text-xs text-ink-3">{d.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 'monto' && (
          <>
            <AmountView
              amount={amount}
              hint={`Disponible ${formatMoney(available)} en USDT`}
              error={error}
            />
            <div className="mt-6">
              <AmountPad onPress={press} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('destino')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button
                type="button"
                onClick={() => setStep('confirmar')}
                disabled={blocked}
                data-testid="continuar-retiro"
                className="btn btn-primary text-sm disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 'confirmar' && (
          <>
            <AmountView amount={amount} />
            {/* Desglose: comisión cero, el total es el monto */}
            <dl className="glass mt-5 divide-y divide-white/5 rounded-3xl p-4 text-sm">
              <div className="flex justify-between gap-3 pb-2">
                <dt className="text-ink-2">Destino</dt>
                <dd className="truncate text-ink">
                  {dest === 'banco' ? `${BANK_ACCOUNT.bank} ••${BANK_ACCOUNT.last4}` : `Tron · ${RECEIVE_ADDRESSES.Tron.slice(0, 10)}…`}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-ink-2">Monto</dt>
                <dd className="tabular-nums">{formatMoney(value)}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-ink-2">Comisión</dt>
                <dd className="text-up">{formatMoney(0)}</dd>
              </div>
              <div className="flex justify-between gap-3 pt-2 font-medium">
                <dt className="text-ink">Total a recibir</dt>
                <dd className="tabular-nums" data-testid="total-retiro">
                  {formatMoney(value)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('monto')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button
                type="button"
                onClick={confirm}
                data-testid="confirmar-retiro"
                className="btn btn-primary text-sm"
              >
                Confirmar retiro
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      <AnimatePresence>{done && <SuccessCheck title="Retiro enviado" sub={`${formatMoney(value)} en camino`} onDone={finish} />}</AnimatePresence>
    </>
  )
}
