/**
 * RiskGauge — animated SVG semicircle gauge.
 * Uses overall_risk_score_normalized (0–1) for the arc fill.
 * Center displays score / 100 + risk label.
 */

import { useEffect, useRef } from 'react'
import type { PredictionResponse } from '../../types/prediction'
import { riskScoreToGaugeColor, overallLabelToRiskLevel, RISK_COLORS } from '../../utils/riskColors'

interface RiskGaugeProps {
  prediction: PredictionResponse
}

const RADIUS        = 45
const CX            = 60
const CY            = 60
const STROKE_WIDTH  = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS          // ≈ 282.74
const HALF_CIRC     = CIRCUMFERENCE / 2              // ≈ 141.37
const DASH_OFFSET_EMPTY  =  CIRCUMFERENCE * 0.25    //  full-empty position
const DASH_OFFSET_ORIGIN = -CIRCUMFERENCE * 0.25    // arc start position

export function RiskGauge({ prediction }: RiskGaugeProps) {
  const arcRef = useRef<SVGCircleElement>(null)

  // Use the normalized 0–1 value directly — no multiplication
  const normalized  = Math.min(Math.max(prediction.overall_risk_score_normalized ?? (prediction.overall_risk_score / 100), 0), 1)
  const scoreText   = prediction.overall_risk_score.toFixed(1)
  const riskLevel   = overallLabelToRiskLevel(prediction.overall_risk_label)
  const color       = RISK_COLORS[riskLevel] ?? riskScoreToGaugeColor(prediction.overall_risk_score)
  const label       = prediction.overall_risk_label

  // dashoffset-based animation: fixed dasharray = HALF_CIRC, vary dashoffset
  // empty → dashoffset = DASH_OFFSET_EMPTY, full → dashoffset = DASH_OFFSET_ORIGIN
  const targetOffset = DASH_OFFSET_EMPTY - normalized * HALF_CIRC

  useEffect(() => {
    const arc = arcRef.current
    if (!arc) return
    // Start empty (instant)
    arc.style.transition = 'none'
    arc.style.strokeDashoffset = String(DASH_OFFSET_EMPTY)
    void arc.getBoundingClientRect() // force reflow
    // Animate to fill
    arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
    arc.style.strokeDashoffset = String(targetOffset)
  }, [targetOffset])

  return (
    <div>
      <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
        Overall Risk Score
      </p>
      <div className="flex flex-col items-center">
        <svg
          viewBox="0 0 120 70"
          className="w-full max-w-[160px] overflow-visible"
          aria-label={`Risk score ${scoreText} out of 100`}
        >
          {/* Track arc */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="#1e2d45"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${HALF_CIRC} ${CIRCUMFERENCE}`}
            strokeDashoffset={DASH_OFFSET_ORIGIN}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <circle
            ref={arcRef}
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${HALF_CIRC} ${CIRCUMFERENCE}`}
            strokeDashoffset={DASH_OFFSET_EMPTY}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
          {/* Scale labels */}
          <text x="12"  y="68" fill="#475569" fontSize="8" fontFamily="JetBrains Mono">0</text>
          <text x="100" y="68" fill="#475569" fontSize="8" fontFamily="JetBrains Mono">100</text>
        </svg>

        {/* Score + label below arc */}
        <div className="text-center -mt-1">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-mono font-bold text-2xl tabular-nums" style={{ color }}>
              {scoreText}
            </span>
            <span className="text-text-muted font-mono text-xs">/ 100</span>
          </div>
          <p className="font-mono text-xs font-medium mt-0.5 text-text-secondary">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
