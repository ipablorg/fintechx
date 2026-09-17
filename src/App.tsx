import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useState } from 'react'

import { Header } from '@/components/Header'
import { HomeView } from '@/features/HomeView'
import { LoansView } from '@/features/LoansView'
import { SplashView } from '@/features/SplashView'
import { WelcomeView } from '@/features/WelcomeView'

type View = 'inicio' | 'creditos'
type Phase = 'splash' | 'welcome' | 'app'

const INTRO_KEY = 'fx-intro-seen'

/**
 * Fase inicial: la intro ya vista arranca directo en la app, salvo que se la
 * fuerce con ?intro. Si el almacenamiento está bloqueado, se muestra la intro.
 */
function initialPhase(): Phase {
  if (new URLSearchParams(window.location.search).has('intro')) return 'splash'
  try {
    return sessionStorage.getItem(INTRO_KEY) ? 'app' : 'splash'
  } catch {
    return 'splash'
  }
}

export default function App() {
  const [view, setView] = useState<View>('inicio')
  const [phase, setPhase] = useState<Phase>(initialPhase)

  // El splash solo avanza a la bienvenida: la marca de "vista" la pone el gesto.
  const finishSplash = useCallback(() => setPhase('welcome'), [])

  const finishWelcome = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // Almacenamiento no disponible: la intro volverá a mostrarse.
    }
    setPhase('app')
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {/* Resplandores ambientales tras la columna de la app */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-44 left-1/2 h-[440px] w-[620px] -translate-x-1/2 rounded-full bg-bank/[0.09] blur-[130px]" />
          <div className="absolute top-1/3 -right-44 h-[400px] w-[520px] rounded-full bg-tether/[0.09] blur-[130px]" />
        </div>

        {/* Una sola transición por fase: splash → bienvenida → app */}
        <AnimatePresence mode="wait">
          {phase === 'splash' && <SplashView key="splash" onDone={finishSplash} />}
          {phase === 'welcome' && <WelcomeView key="welcome" onDone={finishWelcome} />}
          {phase === 'app' && (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {/* Columna tipo teléfono: el fondo de página sigue de borde a borde */}
              <div className="mx-auto w-full max-w-md">
                <Header onCredits={() => setView('creditos')} />

                <main className="px-4 pt-4 pb-36">
                  <AnimatePresence mode="wait">
                    {view === 'inicio' ? (
                      <HomeView key="inicio" />
                    ) : (
                      <LoansView key="creditos" onBack={() => setView('inicio')} />
                    )}
                  </AnimatePresence>
                </main>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
