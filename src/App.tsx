import { AnimatePresence, MotionConfig } from 'motion/react'
import { useMemo, useState } from 'react'

import { BottomNav, Sidebar, type ViewId } from '@/components/Nav'
import { TransferModal } from '@/components/TransferModal'
import { deriveDashboard, type RangeDays } from '@/data/derive'
import { DashboardView } from '@/features/DashboardView'
import { PlaceholderView } from '@/features/PlaceholderView'

export default function App() {
  const [view, setView] = useState<ViewId>('inicio')
  const [range, setRange] = useState<RangeDays>(30)
  const [sendOpen, setSendOpen] = useState(false)

  const data = useMemo(() => deriveDashboard(range), [range])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {/* Resplandores ambientales tras las tarjetas translúcidas */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-48 left-1/4 h-[460px] w-[680px] rounded-full bg-accent/[0.07] blur-[130px]" />
          <div className="absolute top-1/3 -right-48 h-[420px] w-[560px] rounded-full bg-series-2/[0.09] blur-[130px]" />
        </div>

        <Sidebar view={view} onChange={setView} />

        <main className="lg:pl-60">
          <div className="mx-auto w-full max-w-5xl px-4 pt-7 pb-28 sm:px-6 lg:px-10 lg:pb-12">
            {/* Barra superior solo móvil */}
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <img src="/logo.svg" alt="" className="size-8 rounded-[9px]" />
              <span className="text-[15px] font-semibold tracking-tight">
                Fintech<span className="text-accent">X</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              {view === 'inicio' ? (
                <DashboardView
                  key="inicio"
                  data={data}
                  range={range}
                  onRange={setRange}
                  onSend={() => setSendOpen(true)}
                />
              ) : (
                <PlaceholderView key={view} view={view} />
              )}
            </AnimatePresence>
          </div>
        </main>

        <BottomNav view={view} onChange={setView} />
        <TransferModal open={sendOpen} available={data.current} onClose={() => setSendOpen(false)} />
      </div>
    </MotionConfig>
  )
}
