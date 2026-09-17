import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

/**
 * Overlay de éxito compartido: el check se dibuja con pathLength y regresa el
 * control llamando a `onDone` tras la espera. Lo usan todos los flujos que
 * mutan el store.
 */
export function SuccessCheck({
  title,
  sub,
  onDone,
  delay = 1300,
}: {
  title: string
  sub?: string
  onDone: () => void
  delay?: number
}) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const t = window.setTimeout(onDone, reduced ? Math.min(delay, 400) : delay)
    return () => window.clearTimeout(t)
  }, [onDone, delay, reduced])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-page/95 px-8 backdrop-blur-sm"
      role="status"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="glass grid size-24 place-items-center rounded-full"
        >
          <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }}
            />
          </svg>
        </motion.div>

        <div>
          <p className="headline">{title}</p>
          {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}
