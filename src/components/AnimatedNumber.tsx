import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

type Props = {
  value: number
  format: (v: number) => string
  className?: string
}

/**
 * Número que persigue su valor con un muelle físico. Con `prefers-reduced-motion`
 * salta directo al valor final.
 */
export function AnimatedNumber({ value, format, className }: Props) {
  const reduced = useReducedMotion()
  const spring = useSpring(0, { stiffness: 120, damping: 26, mass: 0.9 })
  const text = useTransform(spring, (v) => format(v))

  useEffect(() => {
    if (reduced) spring.jump(value)
    else spring.set(value)
  }, [value, reduced, spring])

  return <motion.span className={className}>{text}</motion.span>
}
