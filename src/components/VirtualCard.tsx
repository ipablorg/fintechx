import { Snowflake, Wifi } from 'lucide-react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useId, useState, type ReactNode } from 'react'

import baLogo from '@/assets/ba-logo-white.png'
import tetherLogo from '@/assets/tether.svg'
import { CARD } from '@/data/mock'

const ENTRANCE = { duration: 2.2, ease: 'easeInOut' as const, delay: 0.35 }
const FLIP_SPRING = { type: 'spring', stiffness: 240, damping: 26 } as const
const TILT_MAX = 8 // grados

/** Texto con relieve sutil, como tarjeta impresa. */
const embossed = { textShadow: '0 1px 0 rgb(255 255 255 / 0.22), 0 -1px 1px rgb(0 0 0 / 0.5)' }

function Chip({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 42 32" aria-hidden="true" className="w-[11.5cqw]">
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
  children,
}: {
  frozen: boolean
  back?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl"
      style={{
        backfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        filter: frozen ? 'grayscale(1)' : 'none',
        transition: 'filter 300ms ease',
      }}
    >
      {/* Wash de marca sobre el vidrio oscuro */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: back
            ? 'linear-gradient(215deg, rgb(232 33 33 / 0.16), transparent 55%, rgb(0 147 147 / 0.16))'
            : 'linear-gradient(135deg, rgb(232 33 33 / 0.26), transparent 52%, rgb(0 147 147 / 0.24))',
        }}
      />
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

type Props = {
  frozen?: boolean
  revealed?: boolean
}

/** Tarjeta virtual 3D: giro de entrada, tilt con puntero y flip manual. */
export function VirtualCard({ frozen = false, revealed = false }: Props) {
  const reduced = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const [spun, setSpun] = useState(false)
  const chipId = useId()
  const noiseId = useId()

  // Tilt solo con puntero fino (mouse) y fuera del giro de entrada.
  const tiltX = useSpring(0, { stiffness: 220, damping: 22 })
  const tiltY = useSpring(0, { stiffness: 220, damping: 22 })
  const canTilt = !reduced && spun

  const groups = CARD.number.split(' ')
  const masked = `${groups[0]} •••• •••• ${groups[groups.length - 1]}`

  const entrance = !reduced && !spun
  const rotateY = (spun ? 360 : 0) + (flipped ? 180 : 0)

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - rect.left) / rect.width - 0.5) * TILT_MAX * 2)
    tiltX.set(-((e.clientY - rect.top) / rect.height - 0.5) * TILT_MAX * 2)
  }

  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <div className="@container w-full" style={{ perspective: 1200 }}>
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
      >
        <motion.button
          type="button"
          aria-label="Girar tarjeta"
          onClick={() => setFlipped((f) => !f)}
          initial={{ rotateY: 0 }}
          animate={entrance ? { rotateY: [0, 180, 360] } : { rotateY }}
          transition={
            entrance ? ENTRANCE : reduced ? { duration: 0 } : FLIP_SPRING
          }
          onAnimationComplete={() => setSpun(true)}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative block aspect-[1.586] w-full cursor-pointer rounded-2xl shadow-glow-bank"
        >
          {/* Frente */}
          <Face frozen={frozen}>
            <Noise id={noiseId} />

            <div className="relative flex h-full flex-col justify-between p-[5.5cqw]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Chip id={chipId} />
                  <Wifi strokeWidth={2} className="h-[5.5cqw] w-[5.5cqw] rotate-90 text-white/70" />
                </div>
                <span className="flex items-center gap-[1.4cqw] rounded-full bg-black/35 px-[2.8cqw] py-[1cqw] text-[2.8cqw] font-semibold tracking-wide text-white/90">
                  <img src={tetherLogo} alt="" className="h-[3.3cqw] w-auto" />
                  USDT
                </span>
              </div>

              <p
                className="text-[clamp(15px,5.4cqw,23px)] font-medium tracking-[0.16em] text-white tabular-nums"
                style={embossed}
              >
                {revealed ? CARD.number : masked}
              </p>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/55 uppercase" style={embossed}>
                    Titular
                  </p>
                  <p className="truncate text-[min(3.6cqw,14px)] font-semibold text-white" style={embossed}>
                    {CARD.holder}
                  </p>
                </div>
                <div>
                  <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/55 uppercase" style={embossed}>
                    Vence
                  </p>
                  <p className="text-[min(3.6cqw,14px)] font-semibold text-white tabular-nums" style={embossed}>
                    {CARD.expiry}
                  </p>
                </div>
                <p className="text-[min(5cqw,19px)] font-bold text-white italic" style={embossed}>
                  VISA
                </p>
              </div>
            </div>
          </Face>

          {/* Reverso (pre-rotado 180°) */}
          <Face frozen={frozen} back>
            <Noise id={`${noiseId}-b`} />

            <div className="relative flex h-full flex-col">
              {/* Pista magnética */}
              <div aria-hidden="true" className="mt-[6.5cqw] h-[12cqw] w-full bg-black/85" />

              <div className="flex flex-1 flex-col justify-between p-[5.5cqw]">
                <div className="flex items-center gap-3">
                  <span className="flex h-[8.5cqw] flex-1 items-center justify-end rounded-sm bg-white/90 px-[2cqw] text-[min(3.6cqw,14px)] italic text-black/60">
                    {CARD.holder}
                  </span>
                  <span className="rounded-sm bg-white/90 px-[2cqw] py-[1.4cqw] text-[min(3.6cqw,14px)] font-semibold text-black tabular-nums">
                    {CARD.cvv}
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
