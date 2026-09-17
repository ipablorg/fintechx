import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

import { AuroraBackground } from '@/components/AuroraBackground'
import { TxnList } from '@/components/TxnRow'
import { SLIDE_SPRING, TAP_SPRING } from '@/lib/motion'
import { useWallet } from '@/store/use-wallet'

/** Historial completo: pantalla sobre Inicio con búsqueda y filtro del store. */
export function HistoryScreen({ onClose }: { onClose: () => void }) {
  const { state } = useWallet()

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%', transition: { duration: 0.25, ease: 'easeIn' } }}
      transition={SLIDE_SPRING}
      className="fixed inset-0 z-[60] mx-auto max-w-md overflow-y-auto bg-page"
      role="dialog"
      aria-modal="true"
      aria-label="Historial completo"
    >
      <AuroraBackground />

      <div className="flex min-h-dvh flex-col px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+20px)]">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            aria-label="Volver"
            onClick={onClose}
            whileTap={{ scale: 0.92 }}
            transition={TAP_SPRING}
            className="glass grid size-10 cursor-pointer place-items-center rounded-full text-ink-2"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </motion.button>
          <h1 className="headline">Historial completo</h1>
        </div>

        <TxnList txns={state.txns} caption={`${state.txns.length} movimientos · todas las cuentas`} title="Historial" />
      </div>
    </motion.div>
  )
}
