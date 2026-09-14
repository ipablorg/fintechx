import { ArrowDownLeft, Plus, Send, TrendingDown, TrendingUp } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import type { ComponentType } from 'react'

import { AnimatedNumber } from '@/components/AnimatedNumber'
import { BalanceChart } from '@/components/BalanceChart'
import { CashflowChart } from '@/components/CashflowChart'
import { ChartCard, DataTable, LegendChip } from '@/components/ChartCard'
import { Header } from '@/components/Header'
import { SavingsMeter } from '@/components/SavingsMeter'
import { StatTile } from '@/components/StatTile'
import { TransactionList } from '@/components/TransactionList'
import type { Dashboard, RangeDays } from '@/data/derive'
import { formatDayShort, formatMoney, formatMoneySigned, formatPct } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

function QuickAction({
  icon: Icon,
  label,
  primary,
  onClick,
}: {
  icon: ComponentType<{ size?: number | string; strokeWidth?: number | string }>
  label: string
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex w-16 flex-col items-center gap-1.5"
    >
      <span
        className={`grid size-12 place-items-center rounded-2xl transition-colors ${
          primary
            ? 'bg-accent text-page shadow-glow'
            : 'border border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]'
        }`}
      >
        <Icon size={19} strokeWidth={2} />
      </span>
      <span className="text-[11px] text-ink-2">{label}</span>
    </motion.button>
  )
}

type Props = {
  data: Dashboard
  range: RangeDays
  onRange: (r: RangeDays) => void
  onSend: () => void
}

export function DashboardView({ data, range, onRange, onSend }: Props) {
  const deltaUp = data.balanceDelta.abs >= 0
  const DeltaIcon = deltaUp ? TrendingUp : TrendingDown

  const balanceRows = [...data.balance]
    .reverse()
    .map((p) => [formatDayShort(p.date), formatMoney(p.value)])

  const bucketRows = data.buckets.map((b) => [
    b.label,
    formatMoney(b.income),
    formatMoney(b.expense),
    formatMoneySigned(b.income - b.expense),
  ])

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12, transition: { duration: 0.16 } }}
    >
      <Header range={range} onRange={onRange} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Resumen: saldo + evolución */}
        <motion.section variants={item} className="card p-6 lg:col-span-2" aria-label="Resumen del saldo">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm text-ink-2">Saldo total</p>
              <AnimatedNumber
                value={data.current}
                format={formatMoney}
                className="mt-1.5 block text-[40px] leading-none font-semibold tracking-tight sm:text-[46px]"
              />
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    deltaUp ? 'bg-up/10 text-up' : 'bg-down/10 text-down'
                  }`}
                >
                  <DeltaIcon size={13} strokeWidth={2.2} />
                  {data.balanceDelta.pct !== null ? formatPct(data.balanceDelta.pct) : '—'}
                </span>
                <span className="text-ink-3">
                  {formatMoneySigned(data.balanceDelta.abs)} en los últimos {range} días
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <QuickAction icon={Send} label="Enviar" primary onClick={onSend} />
              <QuickAction icon={ArrowDownLeft} label="Solicitar" />
              <QuickAction icon={Plus} label="Recargar" />
            </div>
          </div>

          <div className="mt-6">
            <ChartCard
              title="Evolución del saldo"
              subtitle={`Saldo diario, últimos ${range} días`}
              table={<DataTable caption="Saldo diario" head={['Fecha', 'Saldo']} rows={balanceRows} maxHeight={226} />}
            >
              <BalanceChart points={data.balance} rangeKey={range} />
            </ChartCard>
          </div>
        </motion.section>

        {/* Métricas del periodo */}
        <div className="flex flex-col gap-4">
          <motion.div variants={item}>
            <StatTile
              label="Ingresos"
              value={data.income}
              delta={data.incomeDelta}
              upIsGood
              spark={data.incomeSpark}
              seriesColor="var(--color-series-1)"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatTile
              label="Gastos"
              value={data.expense}
              delta={data.expenseDelta}
              upIsGood={false}
              spark={data.expenseSpark}
              seriesColor="var(--color-series-2)"
            />
          </motion.div>
          <motion.div variants={item} className="flex-1">
            <SavingsMeter rate={data.savingsRate} net={data.net} income={data.income} />
          </motion.div>
        </div>

        {/* Flujo de caja */}
        <motion.section variants={item} className="card p-6 lg:col-span-2" aria-label="Flujo de caja">
          <ChartCard
            title="Flujo de caja"
            subtitle={range === 7 ? 'Por día' : range === 30 ? 'Por semana' : 'Por mes'}
            legend={
              <div className="flex gap-4">
                <LegendChip color="var(--color-series-1)" label="Ingresos" />
                <LegendChip color="var(--color-series-2)" label="Gastos" />
              </div>
            }
            table={
              <DataTable
                caption="Flujo de caja por periodo"
                head={['Periodo', 'Ingresos', 'Gastos', 'Neto']}
                rows={bucketRows}
                maxHeight={234}
              />
            }
          >
            <CashflowChart buckets={data.buckets} rangeKey={range} />
          </ChartCard>
        </motion.section>

        {/* Movimientos */}
        <motion.section variants={item} className="card p-6" aria-label="Últimos movimientos">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium">Movimientos</h3>
            <span className="text-xs text-ink-3">últimos {range} días</span>
          </div>
          <TransactionList transactions={data.transactions} />
        </motion.section>
      </div>
    </motion.div>
  )
}
