import { ArrowLeftRight, CreditCard, Landmark, Wallet, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { useState } from 'react'

import baLogo from '@/assets/ba-logo-white.png'
import { BottomSheet } from '@/components/BottomSheet'
import { PoweredBy } from '@/components/PoweredBy'
import { SlideToStart } from '@/components/SlideToStart'
import { CardFace } from '@/components/VirtualCard'
import { CARDS } from '@/data/mock'
import { CARD_SKIN } from '@/data/skin'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Capas del abanico de bienvenida, de adelante hacia atrás. */
const FAN_LAYERS = [
  { tilt: 0, x: 0, y: 0, z: 3, filter: 'drop-shadow(0 18px 40px rgb(0 0 0 / 0.45))' },
  { tilt: -13, x: 10, y: 12, z: 2, filter: 'brightness(0.45)' },
  { tilt: -24, x: 20, y: 24, z: 1, filter: 'brightness(0.32)' },
]

const SERVICES: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'tarjetas', label: 'Tarjetas USDT respaldadas', icon: CreditCard },
  { id: 'creditos', label: 'Créditos con garantía cripto', icon: Landmark },
  { id: 'pagos', label: 'Pagos y transferencias', icon: ArrowLeftRight },
  { id: 'portafolio', label: 'Portafolio multi-activo', icon: Wallet },
]

type Sheet = 'cuenta' | 'ayuda'
const SHEET_LABEL: Record<Sheet, string> = {
  cuenta: 'Crear cuenta',
  ayuda: '¿Necesitas ayuda?',
}

/**
 * Bienvenida previa a la app: identidad, promesa, tarjeta flotante, servicios y
 * el gesto de entrada. Al completar el gesto se marca la intro como vista.
 */
export function WelcomeView({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [sheet, setSheet] = useState<Sheet | null>(null)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.28 } }}
      className="flex min-h-dvh flex-col px-5 pt-[calc(env(safe-area-inset-top)+28px)] pb-[calc(env(safe-area-inset-bottom)+20px)]"
    >
      {/* Identidad de producto */}
      <motion.div variants={item} className="flex items-center gap-2.5">
        <img src={baLogo} alt="Banco Amazonas" className="h-6 w-auto" />
      </motion.div>

      <motion.h1 variants={item} className="title-large mt-5 max-w-[19ch]">
        Bienvenido a tu banca <span className="text-bank">digital</span>
      </motion.h1>

      <motion.p variants={item} className="mt-3 max-w-[36ch] text-sm text-ink-2">
        Tarjetas USDT, pagos, créditos con garantía cripto y tu portafolio multi-activo en un solo lugar.
      </motion.p>

      {/* Abanico hero: tres tarjetas en diagonal flotando en bucle, sin interacción */}
      <motion.section variants={item} aria-label="Tus tarjetas USDT" className="mt-8">
        <motion.div
          animate={reduced ? undefined : { y: [0, -7, 0] }}
          transition={reduced ? undefined : { duration: 6, ease: 'easeInOut', repeat: Infinity }}
          className="pointer-events-none relative mx-auto h-[264px] w-[76%]"
        >
          {CARDS.slice(0, FAN_LAYERS.length)
            .map((card, i) => ({ card, layer: FAN_LAYERS[i]! }))
            .reverse()
            .map(({ card, layer }) => (
              <div
                key={card.id}
                className="absolute inset-x-0 top-0"
                style={{
                  transform: `rotate(${layer.tilt}deg) translate(${layer.x}px, ${layer.y}px)`,
                  zIndex: layer.z,
                  filter: layer.filter,
                }}
              >
                <CardFace card={card} skin={CARD_SKIN} />
              </div>
            ))}
        </motion.div>
      </motion.section>

      {/* Servicios */}
      <motion.section variants={item} aria-label="Servicios" className="mt-9">
        <h2 className="title-section">Servicios</h2>
        <ul className="mt-3 grid gap-2">
          {SERVICES.map(({ id, label, icon: Icon }) => (
            <motion.li
              key={id}
              variants={item}
              className="flex items-center gap-3 rounded-full border border-line bg-panel-2/60 py-2 pr-4 pl-2"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-panel-2 text-ink-2">
                <Icon size={17} strokeWidth={1.9} />
              </span>
              <span className="text-sm text-ink-2">{label}</span>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* CTA: gesto de entrada */}
      <motion.div variants={item} className="mt-9">
        <SlideToStart onDone={onDone} />
      </motion.div>

      {/* Accesos secundarios */}
      <motion.div variants={item} className="mt-3 flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => setSheet('cuenta')}
          className="btn btn-ghost flex-1 text-sm text-ink-2"
        >
          Crear cuenta
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => setSheet('ayuda')}
          className="btn btn-ghost flex-1 text-sm text-ink-2"
        >
          ¿Necesitas ayuda?
        </motion.button>
      </motion.div>

      {/* Pie: nunca se recorta, baja con mt-auto */}
      <motion.footer variants={item} className="mt-auto pt-9">
        <PoweredBy />
      </motion.footer>

      <AnimatePresence>
        {sheet && (
          <BottomSheet key={sheet} label={SHEET_LABEL[sheet]} onClose={() => setSheet(null)}>
            <h2 className="title-section">{SHEET_LABEL[sheet]}</h2>
            <p className="mt-1 text-sm text-ink-2">Disponible próximamente en la beta</p>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
