import { motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'

/** Muelle de entrada y salida de la hoja. */
const SHEET_SPRING = { type: 'spring', stiffness: 380, damping: 36 } as const

/**
 * Hoja inferior genérica: sube con muelle, se cierra con Escape, velo o
 * arrastre. La carcasa es compartida; el cuerpo lo aporta quien la abre.
 */
export function BottomSheet({ label, children, onClose }: { label: string; children: ReactNode; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [onClose])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SHEET_SPRING}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose()
        }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md cursor-grab rounded-t-3xl border-t border-line bg-panel p-5 pb-[calc(env(safe-area-inset-bottom)+24px)] outline-none active:cursor-grabbing"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />

        {children}
      </motion.div>
    </>
  )
}
