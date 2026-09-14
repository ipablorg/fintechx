import { AnimatePresence, MotionConfig } from 'motion/react'
import { useState } from 'react'

import { Header } from '@/components/Header'
import { Nav, type ViewId } from '@/components/Nav'
import { CardsView } from '@/features/CardsView'
import { HomeView } from '@/features/HomeView'
import { LoansView } from '@/features/LoansView'

export default function App() {
  const [view, setView] = useState<ViewId>('inicio')

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {/* Resplandores ambientales tras la columna de la app */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-44 left-1/2 h-[440px] w-[620px] -translate-x-1/2 rounded-full bg-bank/[0.09] blur-[130px]" />
          <div className="absolute top-1/3 -right-44 h-[400px] w-[520px] rounded-full bg-tether/[0.09] blur-[130px]" />
        </div>

        {/* Columna tipo teléfono: el fondo de página sigue de borde a borde */}
        <div className="mx-auto w-full max-w-md">
          <Header />

          <main className="px-4 pt-4 pb-36">
            <AnimatePresence mode="wait">
              {view === 'inicio' ? (
                <HomeView key="inicio" />
              ) : view === 'tarjetas' ? (
                <CardsView key="tarjetas" />
              ) : (
                <LoansView key="creditos" />
              )}
            </AnimatePresence>
          </main>
        </div>

        <Nav view={view} onChange={setView} />
      </div>
    </MotionConfig>
  )
}
