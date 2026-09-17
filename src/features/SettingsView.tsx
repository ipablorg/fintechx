import { ChevronRight } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { useState } from 'react'

import { Avatar } from '@/components/Avatar'
import { PoweredBy } from '@/components/PoweredBy'
import { Toggle } from '@/components/Toggle'
import { USER } from '@/data/mock'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/**
 * Ajustes: perfil, preferencias con interruptores, idioma, legal, co-brand y
 * cierre de sesión (App decide qué limpiar y a qué fase volver).
 */
export function SettingsView({ onLogout }: { onLogout: () => void }) {
  const [notifications, setNotifications] = useState(true)
  const [biometrics, setBiometrics] = useState(false)
  const [hideBalances, setHideBalances] = useState(false)

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <motion.div variants={item} className="mb-4 px-1">
        <h1 className="title-large">Ajustes</h1>
      </motion.div>

      {/* Perfil */}
      <motion.section variants={item} className="glass flex items-center gap-3 rounded-3xl p-4" aria-label="Perfil">
        <Avatar initials={USER.initials} color={USER.color} className="size-12 text-sm" />
        <div className="min-w-0">
          <p className="headline">{USER.name}</p>
          <p className="truncate text-xs text-ink-3">{USER.email}</p>
        </div>
      </motion.section>

      {/* Preferencias */}
      <motion.section variants={item} className="glass mt-4 divide-y divide-white/5 rounded-3xl p-1" aria-label="Preferencias">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Notificaciones</span>
          <Toggle checked={notifications} onChange={setNotifications} label="Notificaciones" />
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Biometría</span>
          <Toggle checked={biometrics} onChange={setBiometrics} label="Biometría" />
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <span className="text-sm text-ink">Ocultar saldos al abrir</span>
          <Toggle checked={hideBalances} onChange={setHideBalances} label="Ocultar saldos al abrir" />
        </div>
        <button
          type="button"
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
        <button type="button" className="flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left">
          <span className="text-sm text-ink">Términos y condiciones</span>
          <ChevronRight size={15} strokeWidth={1.6} className="text-ink-3" />
        </button>
        <button type="button" className="flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left">
          <span className="text-sm text-ink">Política de privacidad</span>
          <ChevronRight size={15} strokeWidth={1.6} className="text-ink-3" />
        </button>
      </motion.section>

      {/* Cierre de sesión */}
      <motion.div variants={item} className="mt-4">
        <button
          type="button"
          onClick={onLogout}
          className="btn w-full border border-red-bright/25 bg-red-bright/10 text-sm text-red-bright hover:bg-red-bright/20"
        >
          Cerrar sesión
        </button>
      </motion.div>

      {/* Co-brand */}
      <motion.footer variants={item} className="mt-8">
        <PoweredBy />
      </motion.footer>
    </motion.div>
  )
}
