/**
 * ProbabilityBar
 * Displays an adjusted probability value alongside an animated gradient bar.
 * When raw probability differs from adjusted, shows both values visibly.
 */

import { motion } from 'framer-motion'
import { Tooltip } from '../ui/Tooltip'
import type { RiskLevel } from '../../types/prediction'
import { RISK_COLORS } from '../../utils/riskColors'

interface ProbabilityBarProps {
  /** Threshold-adjusted probability (0–1) — primary display value */
  probability: number
  /** Raw model output before adjustment — shown as secondary text when present */
  rawProbability?: number
  riskLevel: RiskLevel
  /** Stagger delay for the bar animation in seconds */
  animationDelay?: number
}

// Gradient track always runs green → yellow → orange → red
const GRADIENT_TRACK =
  'linear-gradient(90deg, #10b981 0%, #4ade80 18%, #eab308 38%, #f97316 62%, #ef4444 82%, #dc2626 100%)'

export function ProbabilityBar({
  probability,
  rawProbability,
  riskLevel,
  animationDelay = 0,
}: ProbabilityBarProps) {
  const pct = Math.min(Math.max(probability * 100, 0), 100)
  const fillColor = RISK_COLORS[riskLevel]
  const hasRaw = rawProbability !== undefined && rawProbability !== probability

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {/* Numeric values */}
      <div className="flex flex-col shrink-0 gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-text-primary tabular-nums text-xs w-[4.2rem]">
            {probability.toFixed(4)}
          </span>
          {hasRaw && (
            <Tooltip
              side="top"
              maxWidth={220}
              content={
                <div className="space-y-1">
                  <p className="font-mono text-text-primary text-xs">
                    <span className="text-text-muted">Adjusted: </span>
                    {probability.toFixed(6)}
                  </p>
                  <p className="font-mono text-text-primary text-xs">
                    <span className="text-text-muted">Raw model: </span>
                    {rawProbability!.toFixed(6)}
                  </p>
                  <p className="text-[10px] text-text-muted leading-snug mt-1">
                    Adjusted to ensure biological consistency (P increases with IC50 threshold).
                  </p>
                </div>
              }
            />
          )}
        </div>
        {hasRaw && (
          <span className="font-mono text-text-muted tabular-nums text-[10px] w-[4.2rem]">
            raw {rawProbability!.toFixed(4)}
          </span>
        )}
      </div>

      {/* Bar track + fill */}
      <div className="flex-1 relative h-2 rounded-full overflow-hidden min-w-[64px]">
        {/* Gradient track — always visible at low opacity */}
        <div
          className="absolute inset-0 rounded-full opacity-15"
          style={{ background: GRADIENT_TRACK }}
        />

        {/* Filled portion — solid risk-level colour */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, delay: animationDelay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: fillColor,
            boxShadow: `0 0 6px ${fillColor}66`,
          }}
        />

        {/* Subtle tick marker at 50% decision boundary */}
        <div className="absolute top-0 bottom-0 w-px bg-border-bright/60" style={{ left: '50%' }} />
      </div>
    </div>
  )
}
