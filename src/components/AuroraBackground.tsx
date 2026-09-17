import { motion, useReducedMotion } from 'motion/react'

/** Grano fino (feTurbulence) inline: rompe el banding de los degradados. */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

/**
 * Fondo "aurora" del sistema, apilado en capas fijas detrás de todo:
 * base casi negra → núcleo rojo caliente arriba-izquierda → mancha de vino que
 * se abre en diagonal → contrapunto azul abajo-derecha → haz blanco muy tenue →
 * grano. Los dos blobs de arriba derivan lentamente (±3 %) salvo con
 * reduced motion: profundidad sin llamar la atención.
 */
export function AuroraBackground() {
  const reduced = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page">
      {/* 1. Base: negro profundo con un pelín de calidez hacia abajo */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #07070C 0%, #0B0A0C 100%)' }} />

      {/* Capa viva: núcleo y vino derivan juntos, muy despacio */}
      <motion.div
        className="absolute -inset-[6%]"
        animate={reduced ? undefined : { x: ['-1.5%', '1.5%'], y: ['-1%', '1%'], scale: [1.01, 1.04] }}
        transition={reduced ? undefined : { duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        {/* 2. Núcleo caliente: rojo saturado y luminoso, con centro pequeño brillante */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(16% 11% at 25% 12%, rgb(255 96 74 / 0.85) 0%, rgb(224 26 26 / 0) 72%)',
              'radial-gradient(44% 34% at 25% 13%, rgb(224 26 26 / 0.92) 0%, rgb(192 13 13 / 0.5) 42%, rgb(192 13 13 / 0) 74%)',
            ].join(', '),
          }}
        />

        {/* 3. Vino/magenta: se extiende en diagonal desde el núcleo al centro-derecha */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 42% at 58% 27%, rgb(122 18 48 / 0.6) 0%, rgb(122 18 48 / 0.22) 45%, rgb(122 18 48 / 0) 74%)',
          }}
        />
      </motion.div>

      {/* 4. Contrapunto frío: azul profundo abajo-derecha */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(72% 52% at 84% 90%, rgb(27 35 64 / 0.85) 0%, rgb(27 35 64 / 0.3) 48%, rgb(27 35 64 / 0) 76%)',
        }}
      />

      {/* 5. Haz diagonal sutil que cruza la mitad superior */}
      <div
        className="absolute top-[-12%] left-[-28%] h-[46%] w-[156%] -rotate-[18deg]"
        style={{
          background:
            'linear-gradient(180deg, rgb(255 255 255 / 0) 0%, rgb(255 255 255 / 0.035) 48%, rgb(255 255 255 / 0) 100%)',
        }}
      />

      {/* 6. Grano anti-banding */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: '160px 160px' }}
      />
    </div>
  )
}
