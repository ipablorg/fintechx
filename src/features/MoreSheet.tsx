import { ArrowLeftRight, ChevronRight, History, LifeBuoy } from 'lucide-react'
import { useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { ConvertSheet } from '@/features/ConvertSheet'
import { SupportBody } from '@/features/SupportSheet'

type Step = 'menu' | 'soporte' | 'convertir'

/**
 * Tile "Más": acciones reales del wallet. Convertir vive dentro de la misma
 * hoja; historial y soporte resuelven en el momento.
 */
export function MoreSheet({ onClose, onHistory }: { onClose: () => void; onHistory: () => void }) {
  const [step, setStep] = useState<Step>('menu')

  if (step === 'convertir') return <ConvertSheet onClose={onClose} />

  return (
    <BottomSheet label="Más opciones" onClose={onClose}>
      {step === 'menu' ? (
        <>
          <h2 className="title-section">Más opciones</h2>
          <ul className="mt-3 grid gap-2">
            {[
              {
                id: 'convertir',
                icon: ArrowLeftRight,
                label: 'Convertir',
                sub: 'Cambia entre USDT y USDC al 1:1',
                action: () => setStep('convertir'),
              },
              {
                id: 'historial',
                icon: History,
                label: 'Historial completo',
                sub: 'Busca y filtra todos tus movimientos',
                action: () => {
                  onClose()
                  onHistory()
                },
              },
              {
                id: 'soporte',
                icon: LifeBuoy,
                label: 'Soporte',
                sub: 'Escríbenos y te ayudamos',
                action: () => setStep('soporte'),
              },
            ].map(({ id, icon: Icon, label, sub, action }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={action}
                  data-testid={`mas-${id}`}
                  className="glass flex w-full cursor-pointer items-center gap-3 rounded-3xl p-4 text-left"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{label}</span>
                    <span className="block truncate text-xs text-ink-3">{sub}</span>
                  </span>
                  <ChevronRight size={16} strokeWidth={1.6} className="shrink-0 text-ink-3" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep('menu')}
            className="mb-3 cursor-pointer text-xs text-ink-3 transition-colors hover:text-ink"
          >
            ← Volver
          </button>
          <h2 className="title-section">Soporte</h2>
          <p className="mt-1 mb-4 text-sm text-ink-2">Estamos para ayudarte</p>
          <SupportBody />
        </>
      )}
    </BottomSheet>
  )
}
