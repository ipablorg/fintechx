import baLogo from '@/assets/ba-logo.png'
import tetherLogo from '@/assets/tether.svg'

/** Barra superior fija: marca del banco + sello co-branded con Tether. */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <img src={baLogo} alt="Banco Amazonas" className="h-6 w-auto" />

        <span className="flex items-center gap-1.5 rounded-full border border-line bg-panel-2 py-1 pr-2.5 pl-2 text-[11px] font-medium text-ink-2">
          <span aria-hidden="true" className="text-ink-3">
            ×
          </span>
          <img src={tetherLogo} alt="Tether" className="h-3.5 w-auto" />
        </span>
      </div>
    </header>
  )
}
