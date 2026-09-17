import { HandCoins } from 'lucide-react'

import baLogo from '@/assets/ba-logo-white.png'

/** Barra superior fija: marca del banco + acceso a Créditos. */
export function Header({ onCredits }: { onCredits: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <img src={baLogo} alt="Banco Amazonas" className="h-6 w-auto" />

        <button type="button" onClick={onCredits} className="btn btn-ghost gap-1.5 px-3 py-1.5 text-[12px]">
          <HandCoins size={15} strokeWidth={1.9} />
          Créditos
        </button>
      </div>
    </header>
  )
}
