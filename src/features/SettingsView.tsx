import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { Avatar } from '@/components/Avatar'
import { BottomSheet } from '@/components/BottomSheet'
import { BrandBar } from '@/components/BrandBar'
import { PoweredBy } from '@/components/PoweredBy'
import { Toggle } from '@/components/Toggle'
import { USER } from '@/data/mock'
import { useWallet, useWalletActions } from '@/store/use-wallet'
import { container, item } from '@/lib/motion'

type InfoSheet = 'idioma' | 'terminos' | 'privacidad'

const INFO: Record<InfoSheet, { title: string; body: string }> = {
  idioma: {
    title: 'Idioma',
    body: 'La app está disponible en Español. Otras circunstancias de idioma llegarán en próximas versiones de la beta.',
  },
  terminos: {
    title: 'Términos y condiciones',
    body: 'Los servicios de tarjeta, custodia y crédito operan sobre activos digitales. Los movimientos de la demo se ejecutan en un entorno de pruebas y ningún fondo real se mueve en esta versión.',
  },
  privacidad: {
    title: 'Política de privacidad',
    body: 'Tus datos de perfil y movimientos se guardan solo en este dispositivo durante la sesión. No compartimos información con terceros.',
  },
}

/**
 * Ajustes: perfil, preferencias conectadas al store (ocultar saldos gobierna
 * toda la app, notificaciones la campana), biometría con feedback tipo toast,
 * idioma y legal con contenido real, y cierre de sesión.
 */
export function SettingsView({ onLogout }: { onLogout: () => void }) {
  const { state } = useWallet()
  const { setPref } = useWalletActions()
  const [toast, setToast] = useState<string | null>(null)
  const [sheet, setSheet] = useState<InfoSheet | null>(null)

  const { prefs, account } = state

  // El toast de biometría se apaga solo.
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const toggleBiometrics = (v: boolean) => {
    setPref('biometrics', v)
    setToast(v ? 'Biometría activada para autorizar operaciones' : 'Biometría desactivada')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <BrandBar />

      <motion.div variants={item} className="mb-4 px-1">
        <h1 className="title-large">Ajustes</h1>
      </motion.div>

      {/* Perfil */}
      <motion.section variants={item} className="glass flex items-center gap-3 rounded-3xl p-4" aria-label="Perfil">
        <Avatar src={USER.avatar} initials={USER.initials} color={USER.color} className="size-12 text-sm" />
        <div className="min-w-0">
          <p className="headline">{account?.name || USER.name}</p>
          <p className="truncate text-xs text-ink-3">{account?.email || USER.email}</p>
        </div>
      </motion.section>

      {/* Preferencias, todas vivas en el store */}
      <motion.section variants={item} className="glass mt-4 divide-y divide-white/5 rounded-3xl p-1" aria-label="Preferencias">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Notificaciones</span>
          <Toggle
            checked={prefs.notifications}
            onChange={(v) => setPref('notifications', v)}
            label="Notificaciones"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Biometría</span>
          <Toggle checked={prefs.biometrics} onChange={toggleBiometrics} label="Biometría" />
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Ocultar saldos</span>
          <Toggle
            checked={prefs.hideBalances}
            onChange={(v) => setPref('hideBalances', v)}
            label="Ocultar saldos"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheet('idioma')}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left"
          aria-label="Idioma, español"
        >
          <span className="text-sm text-ink">Idioma</span>
          <span className="flex items-center gap-1 text-sm text-ink-3">
            Español
            <ChevronRight size={15} strokeWidth={1.6} />
          </span>
        </button>
      </motion.section>

      {/* Legal */}
      <motion.section variants={item} className="glass mt-4 divide-y divide-white/5 rounded-3xl p-1" aria-label="Legal">
        <button
          type="button"
          onClick={() => setSheet('terminos')}
          className="flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left"
        >
          <span className="text-sm text-ink">Términos y condiciones</span>
          <ChevronRight size={15} strokeWidth={1.6} className="text-ink-3" />
        </button>
        <button
          type="button"
          onClick={() => setSheet('privacidad')}
          className="flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left"
        >
          <span className="text-sm text-ink">Política de privacidad</span>
          <ChevronRight size={15} strokeWidth={1.6} className="text-ink-3" />
        </button>
      </motion.section>

      {/* Cierre de sesión */}
      <motion.div variants={item} className="mt-4">
        <button
          type="button"
          onClick={onLogout}
          className="btn w-full cursor-pointer border border-red-bright/25 bg-red-bright/10 text-sm text-red-bright hover:bg-red-bright/20"
        >
          Cerrar sesión
        </button>
      </motion.div>

      {/* Co-brand */}
      <motion.footer variants={item} className="mt-8">
        <PoweredBy />
      </motion.footer>

      {/* Toast de feedback (biometría) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            role="status"
            className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+86px)] z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-panel-2/95 px-4 py-3 text-center text-xs text-ink shadow-xl backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hojas informativas de idioma y legal */}
      <AnimatePresence>
        {sheet && (
          <BottomSheet key={sheet} label={INFO[sheet].title} onClose={() => setSheet(null)}>
            <h2 className="title-section">{INFO[sheet].title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{INFO[sheet].body}</p>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
