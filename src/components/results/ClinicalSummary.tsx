import { Stethoscope, AlertTriangle, Info, Clock } from 'lucide-react'
import type { PredictionResponse } from '../../types/prediction'
import { getDominantThresholdLabel } from '../../utils/formatters'
import { overallLabelToRiskLevel, RISK_COLORS } from '../../utils/riskColors'

interface ClinicalSummaryProps {
  prediction: PredictionResponse
}

const DOMINANT_LABEL: Record<string, string> = {
  tox_1:  '≤1 µM',
  tox_5:  '≤5 µM',
  tox_10: '≤10 µM',
  tox_30: '≤30 µM',
}

export function ClinicalSummary({ prediction }: ClinicalSummaryProps) {
  const riskLevel   = overallLabelToRiskLevel(prediction.overall_risk_label)
  const accentColor = RISK_COLORS[riskLevel]

  return (
    <div
      className="rounded-xl border border-border bg-bg-card overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-bg-elevated/40">
        <Stethoscope className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
        <span className="text-text-primary font-semibold text-xs sm:text-sm">
          Clinical Interpretation
        </span>
        {prediction.dominant_threshold && (
          <span className="ml-auto text-[10px] font-mono text-text-muted shrink-0">
            Primary concern:{' '}
            <span className="text-text-secondary">
              {DOMINANT_LABEL[prediction.dominant_threshold]} threshold
            </span>
          </span>
        )}
      </div>

      <div className="px-4 sm:px-5 py-4 space-y-3">
        {/* Clinical summary text */}
        <p className="text-text-secondary text-sm leading-relaxed">
          {prediction.clinical_summary}
        </p>

        {/* Dominant threshold detail */}
        {prediction.dominant_threshold && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
            <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
            Dominant risk threshold:{' '}
            <span className="text-text-secondary">
              {getDominantThresholdLabel(prediction.dominant_threshold)}
            </span>
          </div>
        )}

        {/* Low confidence warning */}
        {prediction.low_confidence && (
          <div className="flex items-start gap-2 bg-amber-950/50 border border-amber-700/40
            rounded-lg px-3 py-2.5 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Low Model Confidence</p>
              {prediction.confidence_warning && (
                <p className="text-amber-400/80 mt-0.5">{prediction.confidence_warning}</p>
              )}
            </div>
          </div>
        )}

        {/* Monotonicity badge + processing time */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2">
            {prediction.monotonicity_enforced && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono
                text-accent-cyan border border-accent-cyan/30 bg-accent-cyan-glow
                rounded px-2 py-0.5">
                <Info className="w-2.5 h-2.5" />
                Monotonicity correction applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
            <Clock className="w-3 h-3" />
            Computed in {prediction.processing_time_ms.toFixed(0)}ms
          </div>
        </div>
      </div>
    </div>
  )
}
