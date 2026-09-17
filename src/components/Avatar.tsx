import { useState } from 'react'

// ponytail: espejo de --color-page para el gradiente (color-mix no lee tokens).
const PAGE = '#0c0d13'

/**
 * Avatar circular: foto local cuando la hay y degradado con iniciales como
 * respaldo (carga fallida o contacto sin foto). El borde hairline va sobre el
 * círculo completo para que foto e iniciales se recorten igual.
 */
export function Avatar({
  src,
  initials,
  color,
  className = '',
}: {
  src?: string
  initials: string
  color: string
  className?: string
}) {
  const [broken, setBroken] = useState(false)

  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full text-xs font-semibold text-white ring-1 ring-white/10 ring-inset ${className}`}
    >
      {src && !broken ? (
        <img src={src} alt="" onError={() => setBroken(true)} className="size-full object-cover" />
      ) : (
        <span
          className="grid size-full place-items-center"
          style={{ background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 40%, ${PAGE}))` }}
        >
          {initials}
        </span>
      )}
    </span>
  )
}
