import type { CSSProperties } from 'react'

/**
 * Skin común de las tarjetas: vidrio ahumado con borde hairline claro y un halo
 * rojizo muy sutil. El verde vive solo en el logo de Tether.
 */
export const CARD_SKIN: CSSProperties = {
  border: '1px solid rgb(255 255 255 / 0.12)',
  boxShadow: '0 0 60px -22px rgb(229 72 77 / 0.5)',
}
