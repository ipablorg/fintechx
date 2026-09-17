import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { BottomSheet } from '@/components/BottomSheet'
import { Sparkline } from '@/components/Sparkline'
import { TxnList } from '@/components/TxnRow'
import { assetUsd, assetOrFirst } from '@/data/derive'
import type { AssetId } from '@/data/mock'
import { formatMoney, formatPct, formatUnits } from '@/lib/format'
import { useWallet } from '@/store/use-wallet'

/**
 * Detalle de activo: saldo en unidades y USD, sparkline, sus propios
 * movimientos y accesos de Enviar/Recibir preconfigurados con ese activo.
 */
export function AssetDetailSheet({
  assetId,
  onClose,
  onSend,
  onReceive,
}: {
  assetId: AssetId
  onClose: () => void
  /** Enviar/Recibir con este activo ya preseleccionado. */
  onSend: (assetId: AssetId) => void
  onReceive: (assetId: AssetId) => void
}) {
  const { state } = useWallet()
  const asset = assetOrFirst(state.assets, assetId)
  const assetTxns = state.txns.filter((t) => t.asset === assetId)
  const up = asset.change24h >= 0

  return (
    <BottomSheet label={`${asset.name} · detalle`} onClose={onClose}>
      <div className="flex items-center gap-3">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-full"
          style={{ background: `color-mix(in srgb, ${asset.color} 18%, transparent)` }}
        >
          <img src={asset.icon} alt="" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="title-section">{asset.name}</h2>
          <p className="text-xs text-ink-3">
            {asset.symbol} · {formatMoney(asset.priceUsd)}
          </p>
        </div>
        <Sparkline data={asset.spark} endColor={asset.color} width={64} height={30} />
      </div>

      <div className="glass mt-4 rounded-3xl p-4" aria-label="Saldo del activo">
        <p className="text-xs text-ink-3">Saldo</p>
        <p className="mt-1 text-2xl font-bold tracking-[-0.02em] tabular-nums" data-testid="detalle-saldo">
          {formatUnits(asset.balance)} <span className="text-sm font-medium text-ink-2">{asset.symbol}</span>
        </p>
        <p className={`mt-1 text-sm tabular-nums ${up ? 'text-up' : 'text-down'}`}>
          {formatMoney(assetUsd(asset))} · {formatPct(asset.change24h)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onSend(assetId)} data-testid="detalle-enviar" className="btn btn-primary text-sm">
          <ArrowUpRight size={16} strokeWidth={1.8} />
          Enviar
        </button>
        <button type="button" onClick={() => onReceive(assetId)} data-testid="detalle-recibir" className="btn btn-ghost text-sm">
          <ArrowDownLeft size={16} strokeWidth={1.8} />
          Recibir
        </button>
      </div>

      <TxnList txns={assetTxns} caption={`Movimientos en ${asset.symbol}`} title="Actividad" />
    </BottomSheet>
  )
}
