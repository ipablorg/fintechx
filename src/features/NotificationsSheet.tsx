import { Bell } from 'lucide-react'
import { useEffect } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { byDateDesc } from '@/data/derive'
import { formatDayShort } from '@/lib/format'
import { useWallet, useWalletActions } from '@/store/use-wallet'

/**
 * Panel de notificaciones del wallet. Abrirlo marca todo como leído: el punto
 * de la campana se apaga en cuanto el usuario vio la lista.
 */
export function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const { state } = useWallet()
  const { markNotificationsRead } = useWalletActions()

  useEffect(() => {
    markNotificationsRead()
  }, [markNotificationsRead])

  return (
    <BottomSheet label="Notificaciones" onClose={onClose}>
      <h2 className="title-section">Notificaciones</h2>
      <p className="mt-1 text-sm text-ink-2">{state.notifs.length} novedades</p>

      <ul className="mt-4 grid gap-2">
        {[...state.notifs].sort(byDateDesc).map((n) => (
          <li key={n.id} className="glass flex gap-3 rounded-3xl p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-ink-2">
              <Bell size={15} strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{n.title}</span>
                <span className="shrink-0 text-[11px] text-ink-3">{formatDayShort(n.date)}</span>
              </span>
              <span className="mt-0.5 block text-xs text-ink-2">{n.body}</span>
            </span>
            {!n.read && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-up" />}
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
