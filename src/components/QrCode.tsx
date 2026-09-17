import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

/**
 * QR local: `qrcode` pinta el data-URI en el cliente, sin pedir nada a la red.
 * Módulos oscuros sobre baldosa blanca para que cualquier cámara lo lea.
 */
export function QrCode({ value, size = 188 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(value, {
      margin: 1,
      width: size * 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0c0d13', light: '#ffffff' },
    })
      .then((url) => {
        if (alive) setSrc(url)
      })
      .catch(() => {
        if (alive) setSrc(null)
      })
    return () => {
      alive = false
    }
  }, [value, size])

  return (
    <div className="grid size-[216px] place-items-center rounded-3xl bg-white p-3.5" aria-label="Código QR de la dirección">
      {src ? (
        <img src={src} width={size} height={size} alt="" className="size-[188px]" />
      ) : (
        <span className="text-xs text-black/40">Generando QR…</span>
      )}
    </div>
  )
}
