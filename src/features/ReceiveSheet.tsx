import { Check, Copy, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { QrCode } from '@/components/QrCode'
import { RECEIVE_ADDRESSES, type AssetId, type CardNetwork } from '@/data/mock'
import { TAP_SPRING } from '@/lib/motion'

const NETWORKS: CardNetwork[] = ['Tron', 'Ethereum']

/**
 * Recibir: dirección USDT mock por red, QR real generado en el cliente con
 * `qrcode`, copiado con feedback y compartir con fallback a copiar.
 */
export function ReceiveSheet({ assetId, onClose }: { assetId: AssetId; onClose: () => void }) {
  const [network, setNetwork] = useState<CardNetwork>('Tron')
  const [copied, setCopied] = useState(false)
  const address = RECEIVE_ADDRESSES[network]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Portapapeles no disponible (permisos o contexto inseguro).
    }
  }

  const share = async () => {
    const payload = { title: 'Mi dirección', text: address }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload)
        return
      } catch {
        // El usuario canceló o el navegador falló: cae al portapapeles.
      }
    }
    await copy()
  }

  return (
    <BottomSheet label="Recibir" onClose={onClose}>
      <h2 className="title-section">Recibir {assetId.toUpperCase()}</h2>
      <p className="mt-1 text-sm text-ink-2">Escanea el código o comparte tu dirección</p>

      {/* Red de destino: la dirección mock cambia con ella */}
      <div className="glass mt-4 grid grid-cols-2 gap-1 rounded-full p-1" role="group" aria-label="Red de la dirección">
        {NETWORKS.map((net) => (
          <button
            key={net}
            type="button"
            aria-pressed={network === net}
            onClick={() => setNetwork(net)}
            className={`cursor-pointer rounded-full py-2 text-xs font-medium transition-colors ${
              network === net ? 'bg-white text-black' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {net}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <QrCode value={address} />
      </div>

      <p className="mt-4 rounded-2xl bg-white/[0.05] px-4 py-3 text-center font-mono text-[13px] break-all text-ink-2">
        {address}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <motion.button
          type="button"
          onClick={copy}
          whileTap={{ scale: 0.97 }}
          transition={TAP_SPRING}
          className="btn btn-primary text-sm"
          data-testid="copiar-direccion"
        >
          {copied ? <Check size={16} strokeWidth={2.2} /> : <Copy size={16} strokeWidth={1.8} />}
          {copied ? 'Copiado' : 'Copiar'}
        </motion.button>

        <motion.button
          type="button"
          onClick={share}
          whileTap={{ scale: 0.97 }}
          transition={TAP_SPRING}
          className="btn btn-ghost text-sm"
        >
          <Share2 size={16} strokeWidth={1.8} />
          Compartir
        </motion.button>
      </div>

      <p className="mt-4 text-center text-[11px] text-ink-3">
        Envía solo {assetId.toUpperCase()} por la red {network}. Otro activo o red puede perder los fondos.
      </p>
    </BottomSheet>
  )
}
