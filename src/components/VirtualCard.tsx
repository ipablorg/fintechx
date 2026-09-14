import { Snowflake, Wifi } from 'lucide-react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

import baLogo from '@/assets/ba-logo-white.png'
import tetherWhite from '@/assets/tether-white.svg'
import type { CardProduct } from '@/data/mock'

const ENTRANCE = { duration: 2.2, ease: 'easeInOut' as const, delay: 0.35 }

/** ponytail: el giro de entrada corre una sola vez por carga de página. */
let entranceDone = false
const FLIP_SPRING = { type: 'spring', stiffness: 240, damping: 26 } as const
const TILT_MAX = 8 // grados

/**
 * Degradado Tether de todas las caras, oscuro→claro a 135°. Contraste del texto
 * blanco sobre cada parada pura (WCAG, ratio): #0B3D33 12.14:1 · #17805F 4.90:1
 * · #108852 4.50:1. La parada clara original #2BC49A daba 2.22:1 y se oscureció
 * a #108852, el verde más claro que pasa; con el alpha sobre la base opaca
 * bg-page/90 el compuesto sube (~5.7:1 en la parada clara), nunca baja.
 */
const TETHER_WASH =
  'linear-gradient(135deg, rgb(11 61 51 / 0.92), rgb(23 128 95 / 0.88) 52%, rgb(16 136 82 / 0.86))'

/** Texto con relieve sutil, como tarjeta impresa. */
const embossed = { textShadow: '0 1px 0 rgb(255 255 255 / 0.22), 0 -1px 1px rgb(0 0 0 / 0.5)' }

function Chip({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 42 32" aria-hidden="true" className="w-[10cqw]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5e3a8" />
          <stop offset="50%" stopColor="#c9a856" />
          <stop offset="100%" stopColor="#8f7430" />
        </linearGradient>
      </defs>
      <rect width="42" height="32" rx="6" fill={`url(#${id})`} />
      <path
        d="M0 11h11M0 21h11M31 11h11M31 21h11M11 0v32M31 0v32M11 11h20M11 21h20"
        stroke="rgb(0 0 0 / 0.32)"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  )
}

function Noise({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

function Face({
  frozen,
  back = false,
  skin,
  covered = false,
  children,
}: {
  frozen: boolean
  back?: boolean
  /** Borde y glow del skin Tether único. */
  skin?: CSSProperties
  /** Cara que no se ve: oculta, para que nada se filtre por la base translúcida. */
  covered?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl bg-page/90 backdrop-blur-2xl"
      style={{
        backfaceVisibility: 'hidden',
        visibility: covered ? 'hidden' : 'visible',
        transform: back ? 'rotateY(180deg)' : undefined,
        filter: frozen ? 'grayscale(1)' : 'none',
        transition: 'filter 300ms ease',
        ...skin,
      }}
    >
      {/* Degradado Tether sobre el vidrio oscuro */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: TETHER_WASH }} />
      {/* Brillo diagonal */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(115deg, rgb(255 255 255 / 0.08), transparent 45%)' }}
      />

      {children}

      {/* Velo helado cuando la tarjeta está congelada */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: frozen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 grid place-items-center bg-[#bfe3ff]/15"
        style={{ pointerEvents: 'none' }}
      >
        <Snowflake size={30} strokeWidth={1.6} className="text-white/90" />
      </motion.div>
    </div>
  )
}

/** Contenido del frente, compartido por la tarjeta 3D y las capas planas. */
function FrontContent({ card, revealed, chipId, noiseId }: { card: CardProduct; revealed: boolean; chipId: string; noiseId: string }) {
  const masked = `${card.number.slice(0, 4)} •••• •••• ${card.last4}`

  return (
    <>
      <Noise id={noiseId} />

      <div className="relative flex h-full flex-col justify-between p-[5.5cqw]">
        {/* Franja de identificación: logo Tether, nombre en negrita y últimos cuatro */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-[2cqw]">
            <img src={tetherWhite} alt="" className="h-[5.6cqw] w-auto" />
            <span className="text-[min(4.6cqw,18px)] font-bold tracking-[0.04em] text-white" style={embossed}>
              {card.asset}
            </span>
          </span>
          <span className="text-[min(3.8cqw,15px)] font-semibold text-white/85 tabular-nums" style={embossed}>
            •••• {card.last4}
          </span>
        </div>

        <p className="text-[clamp(15px,5.4cqw,23px)] font-medium tracking-[0.16em] text-white tabular-nums" style={embossed}>
          {revealed ? card.number : masked}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-[2.4cqw]">
            <Chip id={chipId} />
            <Wifi strokeWidth={2} className="h-[4.6cqw] w-[4.6cqw] rotate-90 text-white/70" />
          </div>
          <div className="min-w-0">
            <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/55 uppercase" style={embossed}>
              Titular
            </p>
            <p className="truncate text-[min(3.6cqw,14px)] font-semibold text-white" style={embossed}>
              {card.holder}
            </p>
          </div>
          <div>
            <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/55 uppercase" style={embossed}>
              Vence
            </p>
            <p className="text-[min(3.6cqw,14px)] font-semibold text-white tabular-nums" style={embossed}>
              {card.expiry}
            </p>
          </div>
          <p className="text-[min(5cqw,19px)] font-bold text-white italic" style={embossed}>
            VISA
          </p>
        </div>
      </div>
    </>
  )
}

/** Rostro frontal (sin interacción): lo usan la tarjeta activa y las capas de la pila. */
export function CardFace({
  card,
  revealed = false,
  skin,
  className = '',
  style,
}: {
  card: CardProduct
  revealed?: boolean
  skin?: CSSProperties
  className?: string
  style?: CSSProperties
}) {
  const chipId = useId()
  const noiseId = useId()

  return (
    <div
      className={`relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-page/90 backdrop-blur-2xl ${className}`}
      style={{ ...skin, ...style }}
    >
      <div aria-hidden="true" className="absolute inset-0" style={{ background: TETHER_WASH }} />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(115deg, rgb(255 255 255 / 0.08), transparent 45%)' }}
      />
      <FrontContent card={card} revealed={revealed} chipId={chipId} noiseId={noiseId} />
    </div>
  )
}

type Props = {
  card: CardProduct
  /** Estado de volteo controlado desde la vista (botón "Ver reverso"). */
  flipped?: boolean
  frozen?: boolean
  revealed?: boolean
  skin?: CSSProperties
  /** Tocar la tarjeta: alterna el abanico (la tarjeta es el botón que lo anuncia). */
  onClick?: () => void
  ariaLabel?: string
  ariaExpanded?: boolean
  /** Id del botón, para devolverle el foco al colapsar el abanico. */
  id?: string
}

/** Tarjeta virtual 3D de la pila: giro de entrada, tilt con puntero y flip manual. */
export function VirtualCard({
  card,
  flipped = false,
  frozen = false,
  revealed = false,
  skin,
  onClick,
  ariaLabel = 'Cambiar de tarjeta',
  ariaExpanded = false,
  id,
}: Props) {
  const reduced = useReducedMotion()
  const [spun, setSpun] = useState(entranceDone)
  const chipId = useId()
  const noiseId = useId()

  // Tilt solo con puntero fino (mouse) y fuera del giro de entrada.
  const tiltX = useSpring(0, { stiffness: 220, damping: 22 })
  const tiltY = useSpring(0, { stiffness: 220, damping: 22 })
  const canTilt = !reduced && spun

  const entrance = !reduced && !spun
  const rotateY = (spun ? 360 : 0) + (flipped ? 180 : 0)

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - rect.left) / rect.width - 0.5) * TILT_MAX * 2)
    tiltX.set(-((e.clientY - rect.top) / rect.height - 0.5) * TILT_MAX * 2)
  }

  return (
    <div className="@container w-full" style={{ perspective: 1200 }}>
      <motion.div
        onPointerMove={canTilt ? onPointerMove : undefined}
        onPointerLeave={canTilt ? () => (tiltX.set(0), tiltY.set(0)) : undefined}
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <motion.button
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={ariaExpanded}
          onClick={onClick}
          initial={{ rotateY: 0 }}
          animate={entrance ? { rotateY: [0, 180, 360] } : { rotateY }}
          transition={entrance ? ENTRANCE : reduced ? { duration: 0 } : FLIP_SPRING}
          onAnimationComplete={() => {
            setSpun(true)
            entranceDone = true
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative block aspect-[1.586] w-full cursor-pointer rounded-2xl"
        >
          {/* Frente: la fila inferior se levanta para despejar el botón de volteo */}
          <Face frozen={frozen} skin={skin} covered={spun && flipped}>
            <div className="h-full pb-[17cqw]">
              <FrontContent card={card} revealed={revealed} chipId={chipId} noiseId={noiseId} />
            </div>
          </Face>

          {/* Reverso (pre-rotado 180°) */}
          <Face frozen={frozen} back skin={skin} covered={spun && !flipped}>
            <Noise id={`${noiseId}-b`} />

            <div className="relative flex h-full flex-col">
              {/* Pista magnética */}
              <div aria-hidden="true" className="mt-[6.5cqw] h-[12cqw] w-full bg-black/85" />

              <div className="flex flex-1 flex-col justify-between p-[5.5cqw] pe-[15cqw]">
                <div className="flex items-center gap-3">
                  <span className="flex h-[8.5cqw] flex-1 items-center justify-end rounded-sm bg-white/90 px-[2cqw] text-[min(3.6cqw,14px)] italic text-black/60">
                    {card.holder}
                  </span>
                  <span className="rounded-sm bg-white/90 px-[2cqw] py-[1.4cqw] text-[min(3.6cqw,14px)] font-semibold text-black tabular-nums">
                    {card.cvv}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <img src={baLogo} alt="Banco Amazonas" className="h-[5.5cqw] w-auto" />
                  <p className="text-[min(3cqw,12px)] text-white/65" style={embossed}>
                    powered by <span className="font-semibold text-white">Banco Amazonas</span>
                  </p>
                </div>
              </div>
            </div>
          </Face>
        </motion.button>
      </motion.div>
    </div>
  )
}
