import { Snowflake, Wifi } from 'lucide-react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

import baLogo from '@/assets/ba-logo-white.png'
import tetherWhite from '@/assets/tether-white.svg'
import type { CardLimit, CardProduct } from '@/data/mock'
import { MASKED_AMOUNT, formatMoneyParts, formatMoney, formatRate } from '@/lib/format'

const ENTRANCE = { duration: 2.2, ease: 'easeInOut' as const, delay: 0.35 }

/** ponytail: el giro de entrada corre una sola vez por carga de página. */
let entranceDone = false
const FLIP_SPRING = { type: 'spring', stiffness: 240, damping: 26 } as const
const TILT_MAX = 8 // grados

/**
 * Vidrio ahumado del REVERSO: carbón translúcido con brillo diagonal de tinte
 * rojizo. El frente usa FrontMaterial, una base casi opaca para que el saldo
 * mantenga contraste sobre cualquier fondo.
 */
const SMOKE_SHEEN =
  'linear-gradient(125deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.03) 42%, rgb(229 72 77 / 0.12))'

/** Texto con relieve sutil, como tarjeta impresa. */
const embossed = { textShadow: '0 1px 0 rgb(255 255 255 / 0.22), 0 -1px 1px rgb(0 0 0 / 0.5)' }

function Chip({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 42 32" aria-hidden="true" className="w-[10cqw]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f4f6" />
          <stop offset="50%" stopColor="#c6c6cf" />
          <stop offset="100%" stopColor="#8b8b95" />
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

/**
 * Material del frente: base casi negra con gradiente diagonal, luz radial desde
 * arriba-izquierda (el volumen), sheen rojizo direccional y dos siluetas
 * fantasma de tarjetas apiladas recortadas por el borde. Nada de lavado plano.
 */
function FrontMaterial() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #101014 0%, #16161B 100%)' }} />

      {/* Luz que modela el volumen, con caída rápida */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(72% 56% at 8% -6%, rgb(255 255 255 / 0.09) 0%, rgb(255 255 255 / 0) 62%)' }}
      />

      {/* Dos tarjetas fantasma detrás, giradas y recortadas por el borde */}
      <div aria-hidden="true" className="absolute top-[16%] -right-[18%] aspect-[1.586] w-[64%] rotate-[12deg] rounded-[10cqw] bg-white/[0.05]" />
      <div aria-hidden="true" className="absolute top-[28%] -right-[10%] aspect-[1.586] w-[64%] rotate-[24deg] rounded-[10cqw] bg-white/[0.04]" />

      {/* Sheen rojizo solo como dirección, nunca como lavado */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(112deg, rgb(255 255 255 / 0) 42%, rgb(224 26 26 / 0.18) 100%)' }}
      />
    </>
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
  /** Borde y glow del skin de vidrio ahumado. */
  skin?: CSSProperties
  /** Cara que no se ve: oculta, para que nada se filtre por la base translúcida. */
  covered?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={back ? 'absolute inset-0 overflow-hidden rounded-2xl bg-card/55 backdrop-blur-2xl' : 'absolute inset-0 overflow-hidden rounded-2xl bg-[#101014]'}
      style={{
        backfaceVisibility: 'hidden',
        visibility: covered ? 'hidden' : 'visible',
        transform: back ? 'rotateY(180deg)' : undefined,
        filter: frozen ? 'grayscale(1)' : 'none',
        transition: 'filter 300ms ease',
        ...skin,
      }}
    >
      {back ? (
        /* Brillo diagonal con tinte rojizo sobre el vidrio */
        <div aria-hidden="true" className="absolute inset-0" style={{ background: SMOKE_SHEEN }} />
      ) : (
        <FrontMaterial />
      )}

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
function FrontContent({ card, revealed, masked = false, noiseId }: { card: CardProduct; revealed: boolean; masked?: boolean; noiseId: string }) {
  const { whole, cents } = formatMoneyParts(card.balance)

  return (
    <>
      <Noise id={noiseId} />

      <div className="relative flex h-full flex-col justify-between px-[6cqw] pt-[5cqw] pb-[5cqw]">
        {/* Saldo de la tarjeta a la izquierda, marca a la derecha */}
        <div className="flex items-start justify-between gap-[3cqw]">
          <div className="min-w-0">
            <p className="text-[min(3.3cqw,13px)] leading-none text-white/80">Saldo disponible</p>
            <p className="mt-[2cqw] text-[min(7.8cqw,31px)] leading-none font-bold tracking-[-0.02em] tabular-nums">
              {masked ? (
                <span className="text-white" style={embossed}>
                  {MASKED_AMOUNT}
                </span>
              ) : (
                <>
                  <span className="text-white" style={embossed}>
                    {whole}
                  </span>
                  <span className="text-white/80">{cents}</span>
                </>
              )}
            </p>
          </div>

          <span className="flex shrink-0 flex-col items-end gap-[1.6cqw]">
            <span className="flex items-center gap-[1.8cqw]">
              <img src={tetherWhite} alt="" className="h-[4.8cqw] w-auto" />
              <span className="text-[min(3.4cqw,13px)] leading-none font-semibold tracking-[0.04em] text-white" style={embossed}>
                USDT
              </span>
            </span>
            <span className="text-[min(2.9cqw,11px)] leading-none tracking-[0.08em] text-white/80 uppercase">{card.descriptor}</span>
          </span>
        </div>

        {/* Últimos cuatro y red a la izquierda, marca de pago a la derecha */}
        <div className="flex items-end justify-between gap-[3cqw]">
          <div className="min-w-0">
            <p className="text-[min(3.7cqw,14px)] leading-none tracking-[0.14em] text-white tabular-nums" style={embossed}>
              {revealed ? card.number : `•••• ${card.last4}`}
            </p>
            <p className="mt-[1.6cqw] text-[min(2.9cqw,11px)] leading-none tracking-[0.1em] text-white/80 uppercase">{card.network}</p>
          </div>

          <p className="shrink-0 text-[min(5cqw,19px)] leading-none font-bold text-white italic" style={embossed}>
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
  masked = false,
  skin,
  className = '',
  style,
}: {
  card: CardProduct
  revealed?: boolean
  masked?: boolean
  skin?: CSSProperties
  className?: string
  style?: CSSProperties
}) {
  const noiseId = useId()

  return (
    <div
      className={`@container relative aspect-[1.586] w-full overflow-hidden rounded-2xl bg-[#101014] ${className}`}
      style={{ ...skin, ...style }}
    >
      <FrontMaterial />
      <FrontContent card={card} revealed={revealed} masked={masked} noiseId={noiseId} />
    </div>
  )
}

type Props = {
  card: CardProduct
  /** Consumo y tope del mes en curso: alimentan el reverso. */
  limit: CardLimit
  /** Estado de volteo controlado desde la vista (botón "Ver reverso"). */
  flipped?: boolean
  frozen?: boolean
  revealed?: boolean
  /** Preferencia global de saldos ocultos: tapa el saldo del frente. */
  masked?: boolean
  skin?: CSSProperties
  /** Tocar la tarjeta: alterna el abanico (la tarjeta es el botón que lo anuncia). */
  onClick?: () => void
  ariaLabel?: string
  ariaExpanded?: boolean
  /** Id del botón, para devolverle el foco al colapsar el abanico. */
  id?: string
}

/** Bloque de límite mensual del reverso: barra de progreso, consumo y tope. */
function LimitBody({ spent, total }: CardLimit) {
  const ratio = Math.min(1, spent / total)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/80 uppercase" style={embossed}>
          Límite mensual
        </p>
        <p className="text-[min(3.2cqw,13px)] font-semibold text-white tabular-nums">{formatRate(ratio)}</p>
      </div>

      <p className="mt-[0.8cqw] text-[min(4.4cqw,17px)] font-bold text-white tabular-nums" style={embossed}>
        {formatMoney(spent)} <span className="text-[min(3cqw,12px)] font-medium text-white/80">de {formatMoney(total)}</span>
      </p>

      <div
        className="mt-[2.4cqw] me-[16cqw] h-[2.4cqw] overflow-hidden rounded-full bg-black/35"
        role="meter"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatMoney(spent)} de ${formatMoney(total)}`}
        aria-label="Uso del límite mensual"
      >
        <motion.div
          className="h-full rounded-full bg-white/90"
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        />
      </div>
    </div>
  )
}

/** Tarjeta virtual 3D de la pila: giro de entrada, tilt con puntero y flip manual. */
export function VirtualCard({
  card,
  limit,
  flipped = false,
  frozen = false,
  revealed = false,
  masked = false,
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
            <div className="h-full pb-[12cqw]">
              <FrontContent card={card} revealed={revealed} masked={masked} noiseId={noiseId} />
            </div>
          </Face>

          {/* Reverso (pre-rotado 180°): pista, chip, firma, titular/vence, límite y co-brand */}
          <Face frozen={frozen} back skin={skin} covered={spun && !flipped}>
            <Noise id={`${noiseId}-b`} />

            <div className="relative flex h-full flex-col">
              {/* Pista magnética */}
              <div aria-hidden="true" className="mt-[3.5cqw] h-[10cqw] w-full bg-black/85" />

              <div className="flex flex-1 flex-col justify-between gap-[2.5cqw] p-[4.5cqw]">
                {/* Chip + contactless, y a la derecha firma y CVV */}
                <div className="flex items-center justify-between gap-[3cqw]">
                  <span className="flex items-center gap-[2.4cqw]">
                    <Chip id={chipId} />
                    <Wifi strokeWidth={2} className="h-[5cqw] w-[5cqw] rotate-90 text-white/70" />
                  </span>
                  <span className="flex items-center gap-[2cqw]">
                    <span className="flex h-[7cqw] w-[24cqw] items-center justify-end rounded-sm bg-white/90 px-[2cqw] text-[min(3cqw,12px)] italic text-black/60">
                      {card.holder}
                    </span>
                    <span className="rounded-sm bg-white/90 px-[2cqw] py-[1.2cqw] text-[min(3cqw,12px)] font-semibold text-black tabular-nums">
                      {card.cvv}
                    </span>
                  </span>
                </div>

                {/* Titular y vence en columnas */}
                <div className="grid grid-cols-2 gap-[3cqw]">
                  <div className="min-w-0">
                    <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/80 uppercase" style={embossed}>
                      Titular
                    </p>
                    <p className="truncate text-[min(3.4cqw,13px)] font-semibold text-white" style={embossed}>
                      {card.holder}
                    </p>
                  </div>
                  <div>
                    <p className="text-[min(2.6cqw,10px)] tracking-[0.14em] text-white/80 uppercase" style={embossed}>
                      Vence
                    </p>
                    <p className="text-[min(3.4cqw,13px)] font-semibold text-white tabular-nums" style={embossed}>
                      {card.expiry}
                    </p>
                  </div>
                </div>

                <LimitBody spent={limit.spent} total={limit.total} />

                {/* El co-brand se despeja del botón de volteo con padding derecho */}
                <div className="flex items-end justify-between gap-3 pe-[15cqw]">
                  <img src={baLogo} alt="Banco Amazonas" className="h-[5cqw] w-auto" />
                  <p className="text-[min(3cqw,12px)] text-white/80" style={embossed}>
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
