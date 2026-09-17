import { ChevronRight, EyeOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { Sparkline } from '@/components/Sparkline'
import type { Asset } from '@/data/mock'
import { formatMoney, formatPct, formatUnits } from '@/lib/format'
import { useSlideToAct } from '@/lib/useSlideToAct'

const THUMB = 40 // px, lado del pulgar
/** Fracción del recorrido que habilita el desbloqueo al soltar. */
const UNLOCK_RATIO = 0.7

/**
 * Fila de activo con saldo oculto: el nombre siempre visible y el saldo detrás
 * de un deslizador. Arrastrar el pulgar pasando ~70 % del recorrido desbloquea;
 * soltar antes vuelve con muelle. Cada fila recuerda su propio estado.
 */
export function AssetRow({ asset }: { asset: Asset }) {
  const [unlocked, setUnlocked] = useState(false)
  // Desbloqueada, la pista deja de existir: se corta la medición con enabled.
  const { trackRef, travel, dragProps } = useSlideToAct({
    thumb: THUMB,
    ratio: UNLOCK_RATIO,
    onAct: () => setUnlocked(true),
    enabled: !unlocked,
  })

  return (
    <div className="p-3.5">
      <AnimatePresence mode="wait" initial={false}>
        {unlocked ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="flex items-center gap-3"
          >
            <AssetLogo asset={asset} />

            <div className="min-w-0 flex-1">
              <p className="truncate headline">{asset.name}</p>
              <p className="text-xs text-ink-3 tabular-nums">
                {formatUnits(asset.balance)} {asset.symbol}
              </p>
            </div>

            <Sparkline data={asset.spark} endColor={asset.color} width={52} height={26} />

            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums">{formatMoney(asset.usdValue)}</p>
              <p className={`text-xs ${asset.change24h >= 0 ? 'text-up' : 'text-down'}`}>{formatPct(asset.change24h)}</p>
            </div>

            <button
              type="button"
              onClick={() => setUnlocked(false)}
              aria-label={`Ocultar el saldo de ${asset.name}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-line/60 hover:text-ink-2"
            >
              <EyeOff size={15} strokeWidth={1.9} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <AssetLogo asset={asset} />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate headline">{asset.name}</p>
                <span className="shrink-0 text-xs text-ink-3 tabular-nums">{asset.symbol}</span>
              </div>

              {/* Pista del deslizador: el pulgar tapa el texto al avanzar */}
              <div
                ref={trackRef}
                className="relative mt-2.5 h-10 overflow-hidden rounded-full border border-line bg-panel-2/70"
              >
                <p className="shimmer-text pointer-events-none absolute inset-0 grid place-items-center text-[11px] font-medium whitespace-nowrap">
                  Desliza para ver tu saldo
                </p>

                <motion.button
                  type="button"
                  drag="x"
                  dragConstraints={{ left: 0, right: travel }}
                  dragElastic={0.06}
                  dragSnapToOrigin
                  dragMomentum={false}
                  {...dragProps}
                  aria-label={`Desliza o pulsa para ver el saldo de ${asset.name}`}
                  className="absolute top-0 left-0 z-10 grid size-10 cursor-grab touch-none place-items-center rounded-full border border-line bg-panel text-ink-2 shadow-lg active:cursor-grabbing"
                  style={{ width: THUMB, height: THUMB }}
                  whileTap={{ scale: 0.96 }}
                >
                  <ChevronRight size={16} strokeWidth={2.2} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AssetLogo({ asset }: { asset: Asset }) {
  return (
    <span
      className="grid size-10 shrink-0 place-items-center rounded-full"
      style={{ background: `color-mix(in srgb, ${asset.color} 18%, transparent)` }}
    >
      <img src={asset.icon} alt="" className="size-5" />
    </span>
  )
}
