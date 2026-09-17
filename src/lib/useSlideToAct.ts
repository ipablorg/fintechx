import type { PanInfo } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Lado del pulgar en px: el recorrido se mide contra él. */
  thumb: number
  /** Aire entre el pulgar y el borde de la pista, a cada lado. */
  pad?: number
  /** Fracción del recorrido que dispara la acción al soltar. */
  ratio: number
  /** Acción al cruzar el umbral o al tocar el pulgar sin arrastre. */
  onAct: () => void
  /** Falso para dejar de medir (la pista deja de existir). */
  enabled?: boolean
}

/**
 * Protocolo compartido de "desliza para actuar": mide el recorrido de la pista
 * con un ResizeObserver, distingue un tap de un drag (el gesto termina en click,
 * que se swapea) y dispara la acción al soltar pasada la fracción `ratio`.
 * Lo usan la fila de saldo oculto y el CTA de la bienvenida.
 */
export function useSlideToAct({ thumb, pad = 0, ratio, onAct, enabled = true }: Options) {
  const [travel, setTravel] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  // Un drag termina en click: se swapea el click que dispara el propio gesto.
  const dragged = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const el = trackRef.current
    if (!el) return
    const measure = () => setTravel(Math.max(0, el.clientWidth - thumb - pad * 2))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [enabled, thumb, pad])

  const onDragStart = () => (dragged.current = true)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (dragged.current = false), 0)
    if (travel > 0 && info.offset.x >= travel * ratio) onAct()
  }

  // Tap directo (también Enter/Space de teclado): actúa sin exigir recorrido.
  const onClick = () => {
    if (dragged.current) return
    onAct()
  }

  return { trackRef, travel, dragProps: { onDragStart, onDragEnd, onClick } }
}
