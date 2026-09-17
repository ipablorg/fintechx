import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

import baLogo from '@/assets/ba-logo-white.png'
import { AuroraBackground } from '@/components/AuroraBackground'
import { PoweredBy } from '@/components/PoweredBy'

const SPLASH_MS = 2000

/**
 * Splash de arranque: logo del banco con un barrido de brillo y fila de
 * powered-by abajo. Dura ~2 s; cualquier toque, teclado o temporizador avanza.
 */
export function SplashView({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const done = useRef(false)

  useEffect(() => {
    const t = window.setTimeout(onDone, SPLASH_MS)
    return () => window.clearTimeout(t)
  }, [onDone])

  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  return (
    <motion.div
      role="presentation"
      onPointerDown={finish}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3 } }}
      className="relative grid min-h-dvh cursor-pointer place-items-center overflow-hidden"
    >
      <AuroraBackground />

      {/* Botón invisible a pantalla completa: el toque lo cubre el onPointerDown
          del contenedor y el teclado (Enter/Space nativo) lo cubre este botón. */}
      <button type="button" aria-label="Saltar introducción" onClick={finish} className="absolute inset-0 z-10 cursor-pointer" />

      <motion.div
        initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduced ? { duration: 0.3 } : { type: 'spring', stiffness: 220, damping: 20 }}
        className="relative"
      >
        <img src={baLogo} alt="Banco Amazonas" className="h-14 w-auto" />

        {/* Un único barrido de brillo cruzando el logo */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            initial={{ x: '-140%' }}
            animate={{ x: '480%' }}
            transition={{ delay: 0.8, duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        )}
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <PoweredBy />
      </div>
    </motion.div>
  )
}
