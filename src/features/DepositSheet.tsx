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

type Method = 'banco' | 'cripto'
type Step = 'metodo' | 'monto' | 'confirmar'

const LABEL: Record<Step, string> = {
  metodo: 'Depositar',
  monto: 'Monto del depósito',
  confirmar: 'Confirmar depósito',
}

const METHODS: Array<{ id: Method; title: string; sub: string }> = [
  { id: 'banco', title: 'Transferencia bancaria', sub: `${BANK_ACCOUNT.bank} · CBU a nombre de Pablo` },
  { id: 'cripto', title: 'Cripto (red Tron)', sub: 'USDT TRC-20 acreditado en minutos' },
]

/**
 * Depositar: método de entrada, monto en el numpad compartido e instrucciones
 * de confirmación. Al confirmar el saldo de USDT sube en el store.
 */
export function DepositSheet({ onClose }: { onClose: () => void }) {
  const { state } = useWallet()
  const { deposit } = useWalletActions()
  const [step, setStep] = useState<Step>('metodo')
  const [method, setMethod] = useState<Method>('banco')
  const [done, setDone] = useState(false)
  const usdt = assetOrFirst(state.assets, 'usdt')
  // Sin tope: un depósito solo pide que el monto sea mayor a cero.
  const { amount, press, value, blocked, error } = useAmountInput()

  const confirm = () => {
    deposit(method, value)
    setDone(true)
  }

  const finish = () => {
    setDone(false)
    onClose()
  }

  return (
    <>
      <BottomSheet label={LABEL[step]} onClose={onClose}>
        {step === 'metodo' && (
          <>
            <h2 className="title-section">¿Cómo quieres depositar?</h2>
            <ul className="mt-4 grid gap-2">
              {METHODS.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMethod(m.id)
                      setStep('monto')
                    }}
                    className="glass flex w-full cursor-pointer flex-col gap-1 rounded-3xl p-4 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{m.title}</span>
                    <span className="text-xs text-ink-3">{m.sub}</span>
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
              hint={`Saldo disponible ${formatMoney(assetUsd(usdt))}`}
              error={error}
            />
            <div className="mt-6">
              <AmountPad onPress={press} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('metodo')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button
                type="button"
                onClick={() => setStep('confirmar')}
                disabled={blocked}
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
            <dl className="glass mt-5 divide-y divide-white/5 rounded-3xl p-4 text-sm">
              <div className="flex justify-between gap-3 pb-2">
                <dt className="text-ink-2">Método</dt>
                <dd className="text-ink">{method === 'banco' ? 'Transferencia bancaria' : 'Cripto · Tron'}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-ink-2">Destino</dt>
                <dd className="truncate font-mono text-xs text-ink">
                  {method === 'banco' ? `${BANK_ACCOUNT.bank} ••${BANK_ACCOUNT.last4}` : RECEIVE_ADDRESSES.Tron}
                </dd>
              </div>
              <div className="flex justify-between gap-3 pt-2">
                <dt className="text-ink-2">Comisión</dt>
                <dd className="text-up">{formatMoney(0)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-center text-[11px] text-ink-3">
              {method === 'banco'
                ? `Envía desde tu banco al alias ${BANK_ACCOUNT.alias}; los fondos se acreditan al confirmar.`
                : 'Envía USDT TRC-20 a la dirección mostrada; la acreditación es inmediata en la demo.'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep('monto')} className="btn btn-ghost text-sm">
                Volver
              </button>
              <button
                type="button"
                onClick={confirm}
                data-testid="confirmar-deposito"
                className="btn btn-primary text-sm"
              >
                Confirmar depósito
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      {/* Éxito compartido: el saldo ya subió en el store */}
      <AnimatePresence>{done && <SuccessCheck title="Depósito acreditado" sub={`${formatMoney(value)} en USDT`} onDone={finish} />}</AnimatePresence>
    </>
  )
}
