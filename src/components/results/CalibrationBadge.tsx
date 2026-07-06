import { useState } from 'react'
import { CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react'
import type { PredictionResponse } from '../../types/prediction'

interface CalibrationBadgeProps {
  prediction: PredictionResponse
}

type ConfidenceTier = 'high' | 'moderate' | 'low'

function getTier(prediction: PredictionResponse): ConfidenceTier {
  if (prediction.low_confidence || prediction.calibration_distortion > 0.3) return 'low'
  if (prediction.calibration_distortion >= 0.1) return 'moderate'
  return 'high'
}

const TIER_CONFIG: Record<ConfidenceTier, {
  label: string
  icon: typeof CheckCircle2
  className: string
}> = {
  high: {
    label: '✓ High Confidence',
    icon: CheckCircle2,
    className: 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40',
  },
  moderate: {
    label: '~ Moderate Confidence',
    icon: MinusCircle,
    className: 'text-amber-300 border-amber-700/50 bg-amber-950/40',
  },
  low: {
    label: '⚠ Low Confidence',
    icon: AlertTriangle,
    className: 'text-red-300 border-red-700/50 bg-red-950/40',
  },
}

export function CalibrationBadge({ prediction }: CalibrationBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const tier   = getTier(prediction)
  const config = TIER_CONFIG[tier]

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={() => setTooltipOpen(true)}
        onBlur={() => setTooltipOpen(false)}
        aria-label={`Calibration confidence: ${config.label}`}
        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5
          text-[10px] font-mono font-medium cursor-default select-none
          ${config.className}`}
      >
        {config.label}
      </button>

      {tooltipOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-56
          bg-bg-card border border-border rounded-lg px-3 py-2.5
          shadow-card text-[11px] font-mono space-y-1 pointer-events-none">
          <div className="flex justify-between">
            <span className="text-text-muted">Distortion</span>
            <span className="text-text-primary tabular-nums">
              {prediction.calibration_distortion.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Method</span>
            <span className="text-text-secondary">{prediction.calibration_method}</span>
          </div>
          {prediction.confidence_warning && (
            <p className="text-amber-400/80 text-[10px] leading-snug border-t border-border pt-1.5 mt-1.5">
              {prediction.confidence_warning}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
