/**
 * PredictionTable
 * Displays per-threshold hERG cardio toxicity predictions.
 * Uses probability (0–1) from new API schema.
 */

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import type { PredictionResponse } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import { RISK_ROW_ACCENT } from '../../utils/riskColors'
import { formatProbability } from '../../utils/formatters'
import { RiskBadge } from './RiskBadge'
import { ProbabilityBar } from './ProbabilityBar'
import { Tooltip } from '../ui/Tooltip'

interface PredictionTableProps {
  prediction: PredictionResponse
}

const ROW_STAGGER = 0.055

export function PredictionTable({ prediction }: PredictionTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-bg-card">

      {/* ── Section header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-bg-elevated border-b border-border">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="w-0.5 h-4 rounded-full bg-accent-cyan shrink-0" />
          <Activity className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="text-text-primary text-xs sm:text-sm font-semibold truncate">
            Threshold-adjusted toxicity probabilities
          </span>
          <Tooltip
            side="bottom"
            maxWidth={290}
            content={
              <span>
                Probabilities reflect hERG inhibition likelihood at each IC50 cutoff.
                Values are calibrated using{' '}
                <span className="text-text-primary font-medium">
                  {prediction.calibration_method}
                </span>{' '}
                and adjusted for biological consistency.
              </span>
            }
          />
        </div>
        <span className="text-text-muted text-[10px] font-mono tracking-widest uppercase shrink-0 ml-2">
          4 Thresholds
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="hERG threshold predictions"
          style={{ minWidth: '520px' }}>
          <thead>
            <tr className="border-b border-border/70">
              {['Threshold', 'IC50', 'Prediction', 'Probability', 'Risk Level'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 sm:px-4 py-3 text-left text-text-muted font-mono text-[10px]
                    tracking-[0.12em] uppercase select-none bg-bg-elevated/40"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {THRESHOLD_META.map(({ key, display, micromolar }, rowIndex) => {
              const result = prediction.predictions[key]
              if (!result) return null

              return (
                <motion.tr
                  key={key}
                  role="row"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * ROW_STAGGER, duration: 0.28, ease: 'easeOut' }}
                  className={`
                    border-b border-border/40 last:border-0
                    border-l-2 ${RISK_ROW_ACCENT[result.risk_level]}
                    hover:bg-bg-elevated/40 transition-colors duration-150
                  `}
                >
                  {/* Threshold name */}
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">
                    <span className="font-mono text-text-primary text-xs font-medium">{display}</span>
                  </td>

                  {/* IC50 cutoff */}
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">
                    <span className="font-mono text-accent-cyan text-xs font-medium">{micromolar}</span>
                  </td>

                  {/* TOXIC / NON-TOXIC badge */}
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">
                    <span
                      className={`
                        inline-flex items-center gap-1.5 rounded px-2 sm:px-2.5 py-1
                        text-[10px] font-mono font-bold tracking-widest border
                        ${result.prediction
                          ? 'bg-red-950/70    text-red-300    border-red-700/60'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                        }
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${result.prediction ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {result.prediction ? 'TOXIC' : 'NON-TOXIC'}
                    </span>
                  </td>

                  {/* Probability bar (probability is 0–1) */}
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 min-w-[160px] sm:min-w-[180px]">
                    <ProbabilityBar
                      probability={result.probability}
                      riskLevel={result.risk_level}
                      animationDelay={rowIndex * ROW_STAGGER + 0.15}
                    />
                  </td>

                  {/* Risk level badge */}
                  <td className="px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">
                    <RiskBadge risk={result.risk_level} size="sm" dot />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-2.5 bg-bg-elevated/30 border-t border-border/40">
        <span className="text-[10px] text-text-muted font-mono">
          Decision boundary: 50% · Calibration: {prediction.calibration_method} · Model: XGBoost multi-label ensemble
        </span>
      </div>
    </div>
  )
}
