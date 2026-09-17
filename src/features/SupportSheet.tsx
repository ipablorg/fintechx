import { Mail, MessageCircle, Phone } from 'lucide-react'

import { BottomSheet } from '@/components/BottomSheet'
import { SUPPORT } from '@/data/mock'

/** Cuerpo del canal de soporte: contenido real compartido por Bienvenida y Más. */
export function SupportBody() {
  return (
    <div className="grid gap-2">
      {[
        { icon: Mail, label: 'Email', value: SUPPORT.email },
        { icon: MessageCircle, label: 'WhatsApp', value: SUPPORT.phone },
        { icon: Phone, label: 'Horario', value: SUPPORT.hours },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
            <Icon size={16} strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-ink-3">{label}</span>
            <span className="block truncate text-sm text-ink">{value}</span>
          </span>
        </div>
      ))}
      <p className="mt-1 text-center text-[11px] text-ink-3">
        Respondemos en menos de 24 horas hábiles. Ten a mano tu email registrado.
      </p>
    </div>
  )
}

/** Hoja de soporte independiente para quien la abre desde su propia pantalla. */
export function SupportSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet label="Soporte" onClose={onClose}>
      <h2 className="title-section">Soporte</h2>
      <p className="mt-1 mb-4 text-sm text-ink-2">Estamos para ayudarte</p>
      <SupportBody />
    </BottomSheet>
  )
}
