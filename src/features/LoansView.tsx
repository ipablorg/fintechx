import { Sparkles } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

import { LOAN_OFFERS } from '@/data/mock'
import { formatMoney, formatRate } from '@/lib/format'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 28 } },
}

/** Créditos respaldados por activos digitales: recibes stablecoins, dejas colateral. */
export function LoansView() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <motion.div variants={item} className="mb-4 px-1">
        <h1 className="title-large">Créditos</h1>
        <p className="mt-1 text-xs text-ink-3">Recibe stablecoins hoy y deja tus activos como garantía, sin venderlos.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {LOAN_OFFERS.map((offer) => (
          <motion.section
            key={offer.id}
            variants={item}
            aria-label={`Préstamo en ${offer.asset} con garantía ${offer.collateral}`}
            className={`glass rounded-3xl p-5 ${offer.featured ? 'border-white/25' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">
                  Préstamo en {offer.asset} · garantía {offer.collateral}
                </h2>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatMoney(offer.amountUsd)}</p>
              </div>
              {offer.featured && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
                  <Sparkles size={12} strokeWidth={2.2} />
                  Destacado
                </span>
              )}
            </div>

            {/* LTV del colateral */}
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs text-ink-3">
                <span>Uso del colateral (LTV)</span>
                <span className="font-semibold text-ink tabular-nums">{formatRate(offer.ltv)}</span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={Math.round(offer.ltv * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loan-to-value del colateral"
              >
                <div className="h-full rounded-full bg-white/85" style={{ width: `${offer.ltv * 100}%` }} />
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/[0.05] px-2 py-2.5">
                <dt className="text-[10px] tracking-wide text-ink-3 uppercase">APR</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatRate(offer.apr)}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.05] px-2 py-2.5">
                <dt className="text-[10px] tracking-wide text-ink-3 uppercase">Plazo</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{offer.termMonths} meses</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.05] px-2 py-2.5">
                <dt className="text-[10px] tracking-wide text-ink-3 uppercase">Cuota mensual</dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatMoney(offer.monthlyUsd)}</dd>
              </div>
            </dl>

            <button type="button" className={`btn mt-4 w-full text-sm ${offer.featured ? 'btn-primary' : 'btn-ghost'}`}>
              Solicitar crédito
            </button>
          </motion.section>
        ))}
      </div>

      <p className="mt-4 px-1 text-center text-[11px] text-ink-3">
        Cuota estimada. El monto disponible puede variar con el precio del colateral.
      </p>
    </motion.div>
  )
}
