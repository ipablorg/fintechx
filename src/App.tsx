import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useState } from 'react'

import { AuroraBackground } from '@/components/AuroraBackground'
import { BottomNav } from '@/components/BottomNav'
import { type AssetId, type CardProduct, type Contact } from '@/data/mock'
import { CardsView } from '@/features/CardsView'
import { HistoryScreen } from '@/features/HistoryScreen'
import { HomeView } from '@/features/HomeView'
import { LoansView } from '@/features/LoansView'
import { SendMoneyView } from '@/features/SendMoneyView'
import { SettingsView } from '@/features/SettingsView'
import { SplashView } from '@/features/SplashView'
import { WelcomeView } from '@/features/WelcomeView'
import type { Tab } from '@/lib/nav'
import { DEFAULT_CONTACT_ID } from '@/store/use-wallet'
import { WalletProvider } from '@/store/wallet'

/** Vista activa: una pestaña de la nav, Enviar dinero o el Historial completo. */
export type View = Tab | 'enviar' | 'historial'
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
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [view, setView] = useState<View>('inicio')
  // La tarjeta activa se eleva aquí: el chip de Inicio y la pila de Tarjetas
  // comparten la misma selección.
  const [activeId, setActiveId] = useState<CardProduct['id']>('card-principal')
  // Estado de entrada a Enviar: contacto y activo preseleccionados.
  const [sendContact, setSendContact] = useState<Contact['id']>(DEFAULT_CONTACT_ID)
  const [sendAsset, setSendAsset] = useState<AssetId>('usdt')

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

  // Cerrar sesión borra la marca de intro y regresa a la BIENVENIDA, no al splash.
  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_KEY)
    } catch {
      // Almacenamiento no disponible: nada que limpiar.
    }
    setView('inicio')
    setPhase('welcome')
  }, [])

  // Enviar vive sobre la pestaña activa: al cerrar se vuelve a Inicio.
  const openSend = useCallback((contactId?: Contact['id'], assetId?: AssetId) => {
    if (contactId) setSendContact(contactId)
    if (assetId) setSendAsset(assetId)
    setView('enviar')
  }, [])

  const openHistory = useCallback(() => setView('historial'), [])

  // Las pantallas superpuestas (Enviar, Historial) viven sobre Inicio.
  const tab: View = view === 'enviar' || view === 'historial' ? 'inicio' : view

  return (
    <MotionConfig reducedMotion="user">
      <WalletProvider>
        <AuroraBackground />

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
              {/* El padding inferior despeja la cápsula de navegación flotante */}
              <div className="mx-auto w-full max-w-md px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+104px)]">
                <AnimatePresence mode="wait">
                  {tab === 'inicio' && (
                    <HomeView
                      key="inicio"
                      activeId={activeId}
                      onOpenCards={() => setView('tarjetas')}
                      onSend={openSend}
                      onOpenHistory={openHistory}
                    />
                  )}
                  {tab === 'tarjetas' && <CardsView key="tarjetas" activeId={activeId} onSelect={setActiveId} />}
                  {tab === 'creditos' && <LoansView key="creditos" />}
                  {tab === 'ajustes' && <SettingsView key="ajustes" onLogout={logout} />}
                </AnimatePresence>
              </div>

              <BottomNav view={tab} onChange={setView} />

              {/* Pantallas que entran sobre la pestaña activa */}
              <AnimatePresence>
                {view === 'enviar' && (
                  <SendMoneyView
                    key="enviar"
                    contactId={sendContact}
                    assetId={sendAsset}
                    onDone={() => setView('inicio')}
                  />
                )}
                {view === 'historial' && <HistoryScreen key="historial" onClose={() => setView('inicio')} />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </WalletProvider>
    </MotionConfig>
  )
}
