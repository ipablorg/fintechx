import { ArrowDownToLine, ArrowUpFromLine, QrCode, TrendingDown, TrendingUp } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { BalanceChart } from '@/components/BalanceChart'
import { Sparkline } from '@/components/Sparkline'
import { derivePortfolio, PORTFOLIO_RANGE_DAYS } from '@/data/derive'
import { ASSETS } from '@/data/mock'
import { formatMoney, formatPct, formatUnits } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

const QUICK_ACTIONS = [
  { label: 'Depositar', icon: ArrowDownToLine },
  { label: 'Retirar', icon: ArrowUpFromLine },
  { label: 'Pagar', icon: QrCode },
]

/** Inicio: portafolio total en USD, evolución y activos del usuario. */
export function HomeView() {
  const portfolio = derivePortfolio(PORTFOLIO_RANGE_DAYS)
  const up = portfolio.delta.abs >= 0
  const DeltaIcon = up ? TrendingUp : TrendingDown

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      {/* Portafolio */}
      <motion.section variants={item} className="card p-5" aria-label="Portafolio total">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-ink-2">Portafolio total</p>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              up ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
            }`}
          >
            <DeltaIcon size={13} strokeWidth={2.2} />
            {portfolio.delta.pct !== null ? formatPct(portfolio.delta.pct) : '—'}
          </span>
        </div>

        <AnimatedNumber
          value={portfolio.total}
          format={formatMoney}
          className="mt-1.5 block text-[34px] leading-none font-semibold tracking-tight"
        />
        <p className="mt-2 text-xs text-ink-3">Valor en USD · últimos {portfolio.rangeDays} días</p>

        <div className="mt-4">
          <BalanceChart points={portfolio.points} rangeKey={portfolio.rangeDays} />
        </div>
      </motion.section>

      {/* Acciones rápidas */}
      <motion.div variants={item} className="mt-4 grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <motion.button
            key={label}
            type="button"
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="btn btn-ghost flex-col gap-1 py-3 text-[11px]"
          >
            <Icon size={18} strokeWidth={1.9} />
            {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Activos */}
      <motion.section variants={item} className="mt-6" aria-label="Mis activos">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="text-sm font-medium">Mis activos</h2>
          <span className="text-xs text-ink-3">{ASSETS.length} activos</span>
        </div>

        <div className="card divide-y divide-line">
          {ASSETS.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 p-3.5">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full"
                style={{ background: `color-mix(in srgb, ${asset.color} 18%, transparent)` }}
              >
                <img src={asset.icon} alt="" className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{asset.name}</p>
                <p className="text-xs text-ink-3">
                  {formatUnits(asset.balance)} {asset.symbol}
                </p>
              </div>

              <Sparkline data={asset.spark} endColor={asset.color} width={52} height={26} />

              <div className="w-20 shrink-0 text-right">
                <p className="text-sm font-medium tabular-nums">{formatMoney(asset.usdValue)}</p>
                <p className={`text-xs ${asset.change24h >= 0 ? 'text-up' : 'text-down'}`}>{formatPct(asset.change24h)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
