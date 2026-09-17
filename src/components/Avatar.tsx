// ponytail: espejo de --color-page para el gradiente (color-mix no lee tokens).
const PAGE = '#0c0d13'

/**
 * Avatar de iniciales: círculo con degradado propio por color. No hay fotos de
 * contacto, así que cada color identifica a la persona.
 */
export function Avatar({ initials, color, className = '' }: { initials: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(140deg, ${color}, color-mix(in srgb, ${color} 40%, ${PAGE}))` }}
    >
      {initials}
    </span>
  )
}
