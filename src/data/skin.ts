import type { CSSProperties } from 'react'

/**
 * Skin Tether único para todas las tarjetas. El acento del sistema sigue siendo
 * teal: el verde vive solo en la tarjeta.
 */
export function tetherSkin(): CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, #108852 60%, transparent)',
    boxShadow: '0 0 70px -18px rgb(16 133 82 / 0.55)',
  }
}
