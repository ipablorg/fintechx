export type Pt = { x: number; y: number }

const f = (n: number) => n.toFixed(2)

/**
 * Interpolación cúbica monótona (Fritsch–Carlson / Steffen): curva suave que
 * nunca sobrepasa los datos — imprescindible en series de dinero, donde un
 * overshoot dibujaría saldos que no existieron.
 */
export function monotonePath(pts: Pt[]): string {
  const n = pts.length
  if (n === 0) return ''
  const first = pts[0]!
  if (n === 1) return `M${f(first.x)},${f(first.y)}`

  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    dx[i] = b.x - a.x
    slope[i] = (b.y - a.y) / (dx[i] || 1e-9)
  }

  const tangent: number[] = [slope[0]!]
  for (let i = 1; i < n - 1; i++) {
    const m0 = slope[i - 1]!
    const m1 = slope[i]!
    if (m0 * m1 <= 0) {
      tangent[i] = 0
    } else {
      const w0 = 2 * dx[i]! + dx[i - 1]!
      const w1 = dx[i]! + 2 * dx[i - 1]!
      tangent[i] = (w0 + w1) / (w0 / m0 + w1 / m1)
    }
  }
  tangent[n - 1] = slope[n - 2]!

  let d = `M${f(first.x)},${f(first.y)}`
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!
    const b = pts[i + 1]!
    const step = dx[i]!
    const c1x = a.x + step / 3
    const c1y = a.y + (tangent[i]! * step) / 3
    const c2x = b.x - step / 3
    const c2y = b.y - (tangent[i + 1]! * step) / 3
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(b.x)},${f(b.y)}`
  }
  return d
}
