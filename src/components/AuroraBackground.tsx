/**
 * Fondo "aurora" del sistema: neblina roja que sangra desde el borde superior
 * (centro-izquierda), degrada a vino y se disuelve en el negro azulado hacia
 * media pantalla. Blobs radiales muy blurreados, nunca una banda plana.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page">
      {/* Sangrado principal: rojo intenso arriba que se apaga hacia el centro */}
      <div className="absolute -top-[22%] left-[-18%] h-[62vh] w-[85vw] rounded-full bg-bank/45 blur-[110px]" />
      {/* Mancha de vino que continúa el degradado hacia abajo */}
      <div className="absolute top-[16%] left-[4%] h-[38vh] w-[70vw] rounded-full bg-bank/[0.18] blur-[150px]" />
      {/* Reflejo tenue al costado opuesto, casi extinguido */}
      <div className="absolute top-[34%] -right-[24%] h-[32vh] w-[55vw] rounded-full bg-red-bright/[0.08] blur-[160px]" />
    </div>
  )
}
