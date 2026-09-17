import type { CSSProperties } from 'react'

/**
 * Skin común de las tarjetas: borde hairline claro, highlight superior de 1px,
 * halo rojizo sutil y sombra exterior profunda. El verde vive solo en el logo
 * de Tether.
 */
export const CARD_SKIN: CSSProperties = {
  border: '1px solid rgb(255 255 255 / 0.12)',
  boxShadow:
    'inset 0 1px 0 rgb(255 255 255 / 0.16), 0 0 60px -22px rgb(229 72 77 / 0.5), 0 28px 50px -26px rgb(0 0 0 / 0.85)',
}
