import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { BrandBar } from '@/components/BrandBar'
import { assetOrFirst } from '@/data/derive'
import { LOAN_OFFERS, type LoanOffer } from '@/data/mock'
import { LoanRequestSheet } from '@/features/LoanRequestSheet'
import { formatMoney, formatRate, formatUnits } from '@/lib/format'
import { useWallet } from '@/store/use-wallet'
import { container, item } from '@/lib/motion'

/** Créditos respaldados por activos digitales: recibes stablecoins, dejas colateral. */
export function LoansView() {
  const { state } = useWallet()
  const [request, setRequest] = useState<LoanOffer | null>(null)

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.16 } }}>
      <BrandBar />

      <motion.div variants={item} className="mb-4 px-1">
        <h1 className="title-large">Créditos</h1>
        <p className="mt-1 text-xs text-ink-3">Recibe stablecoins hoy y deja tus activos como garantía, sin venderlos.</p>
      </motion.div>

      {/* Créditos activos: nacen de solicitudes confirmadas */}
      {state.loans.length > 0 && (
        <motion.section variants={item} className="mb-4" aria-label="Créditos activos">
          <h2 className="title-section mb-2 px-1">Activos</h2>
          <ul className="grid gap-2">
            {state.loans.map((loan) => (
              <li key={loan.id} className="glass rounded-3xl p-4" data-testid="credito-activo">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      Crédito en {loan.asset.toUpperCase()} · garantía {loan.collateral.toUpperCase()}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatMoney(loan.amountUsd)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-up/15 px-2.5 py-1 text-[11px] font-semibold text-up">Activo</span>
                </div>
                <p className="mt-2 text-xs text-ink-3 tabular-nums">
                  {formatRate(loan.apr)} APR · {loan.termMonths} meses · cuota {formatMoney(loan.monthlyUsd)} · colateral{' '}
                  {formatUnits(loan.collateralUsd / assetOrFirst(state.assets, loan.collateral).priceUsd)} {loan.collateral.toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <div className="flex flex-col gap-3">
        {LOAN_OFFERS.map((offer) => (
          <motion.section
            key={offer.id}
            variants={item}
            aria-label={`Préstamo en ${offer.asset.toUpperCase()} con garantía ${offer.collateral.toUpperCase()}`}
            className={`glass rounded-3xl p-5 ${offer.featured ? 'border-white/25' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">
                  Préstamo en {offer.asset.toUpperCase()} · garantía {offer.collateral.toUpperCase()}
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

            <button
              type="button"
              onClick={() => setRequest(offer)}
              data-testid={`solicitar-${offer.id}`}
              className={`btn mt-4 w-full cursor-pointer text-sm ${offer.featured ? 'btn-primary' : 'btn-ghost'}`}
            >
              Solicitar crédito
            </button>
          </motion.section>
        ))}
      </div>

      <p className="mt-4 px-1 text-center text-[11px] text-ink-3">
        Cuota estimada. El monto disponible puede variar con el precio del colateral.
      </p>

      {request && <LoanRequestSheet key={request.id} offer={request} onClose={() => setRequest(null)} />}
    </motion.div>
  )
}
