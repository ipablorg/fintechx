import { ArrowLeftRight } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { AmountPad, AmountView } from '@/components/AmountPad'
import { useAmountInput } from '@/lib/useAmountInput'
import { BottomSheet } from '@/components/BottomSheet'
import { SuccessCheck } from '@/components/SuccessCheck'
import { assetUsd, assetOrFirst } from '@/data/derive'
import type { AssetId } from '@/data/mock'
import { formatMoney, formatUnits } from '@/lib/format'
import { useWallet, useWalletActions } from '@/store/use-wallet'

/**
 * Convertir: intercambio USDT↔USDC a tasa mock 1:1 con validación de saldo.
 * Muta ambos activos y deja los dos movimientos en el historial.
 */
export function ConvertSheet({ onClose }: { onClose: () => void }) {
  const { state } = useWallet()
  const { convert } = useWalletActions()
  const [from, setFrom] = useState<AssetId>('usdt')
  const [done, setDone] = useState(false)

  const to: AssetId = from === 'usdt' ? 'usdc' : 'usdt'
  const source = assetOrFirst(state.assets, from)
  const target = assetOrFirst(state.assets, to)
  const available = assetUsd(source)
  const { amount, press, value, blocked, error } = useAmountInput('0', { max: available })

  const confirm = () => {
    convert(from, to, value)
    setDone(true)
  }

  const finish = () => {
    setDone(false)
    onClose()
  }

  return (
    <>
      <BottomSheet label="Convertir" onClose={onClose}>
        <h2 className="title-section">Convertir stablecoins</h2>
        <p className="mt-1 text-sm text-ink-2">Tasa 1:1, sin comisión</p>

        {/* Par de conversión: el botón central invierte la dirección */}
        <div className="mt-4 flex items-center gap-2">
          {([from, to] as AssetId[]).map((id, i) => (
            <div key={id} className="glass flex flex-1 items-center gap-2 rounded-2xl p-3">
              <img src={assetOrFirst(state.assets, id).icon} alt="" className="size-6" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-3">{i === 0 ? 'Conviertes' : 'Recibes'}</span>
                <span className="block truncate text-sm font-medium text-ink">{assetOrFirst(state.assets, id).symbol}</span>
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFrom(to)}
            aria-label="Invertir dirección de la conversión"
            className="glass grid size-12 shrink-0 cursor-pointer place-items-center rounded-2xl text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeftRight size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-5">
          <AmountView
            amount={amount}
            hint={`Disponible ${formatMoney(available)} · ${formatUnits(source.balance)} ${source.symbol}`}
            error={error}
          />
        </div>

        <p className="mt-2 text-center text-xs text-ink-3" aria-live="polite">
          Recibirás {formatUnits(value)} {target.symbol}
        </p>

        <div className="mt-5">
          <AmountPad onPress={press} />
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={blocked}
          data-testid="confirmar-conversion"
          className="btn btn-primary mt-4 w-full text-sm disabled:opacity-50"
        >
          Confirmar conversión
        </button>
      </BottomSheet>

      <AnimatePresence>
        {done && (
          <SuccessCheck
            title="Conversión lista"
            sub={`${formatUnits(value)} ${source.symbol} → ${formatUnits(value)} ${target.symbol}`}
            onDone={finish}
          />
        )}
      </AnimatePresence>
    </>
  )
}
