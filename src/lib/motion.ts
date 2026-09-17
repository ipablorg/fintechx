import type { Variants } from 'motion/react'

/*
 * Muelles y variants compartidos: una sola fuente para que todas las vistas
 * entren con el mismo ritmo y los toques respondan igual.
 */

/** Entrada escalonada de una vista: los hijos con `variants` la heredan. */
export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

/** Elemento que sube y aparece dentro de `container`. */
export const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Toque de botón: encogida breve con muelle. */
export const TAP_SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const

/** Entrada de pantallas superpuestas deslizando desde la derecha. */
export const SLIDE_SPRING = { type: 'spring', stiffness: 380, damping: 38 } as const
