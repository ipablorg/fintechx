import { CreditCard, HandCoins, Home, type LucideIcon } from 'lucide-react'

export type ViewId = 'inicio' | 'tarjetas' | 'creditos'

export const NAV_ITEMS: Array<{ id: ViewId; label: string; icon: LucideIcon }> = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
  { id: 'creditos', label: 'Créditos', icon: HandCoins },
]
