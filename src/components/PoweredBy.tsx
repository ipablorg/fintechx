import baLogo from '@/assets/ba-logo-white.png'

/**
 * Fila de co-brand compartida por el splash y el pie de la bienvenida: Banco
 * Amazonas primero y el logo oficial de Tether al final, con la línea de
 * operación y versión debajo.
 */
export function PoweredBy() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-medium tracking-[0.14em] text-ink-3 uppercase">Powered by</span>
        <img src={baLogo} alt="Banco Amazonas" className="h-4 w-auto" />
        <img src="/tether-logo.svg" alt="Tether" className="h-3.5 w-auto" />
      </div>
      <p className="text-xs text-ink-3 tabular-nums">Operado por Loopay · Versión {__APP_VERSION__}</p>
    </div>
  )
}
