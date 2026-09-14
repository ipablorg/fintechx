import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type ViewId = 'inicio' | 'tarjetas' | 'pagos' | 'inversiones' | 'ajustes'

export const NAV_ITEMS: Array<{ id: ViewId; label: string; icon: LucideIcon }> = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
  { id: 'pagos', label: 'Pagos', icon: ArrowLeftRight },
  { id: 'inversiones', label: 'Inversiones', icon: TrendingUp },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
]
