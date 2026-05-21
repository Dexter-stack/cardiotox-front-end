/**
 * RiskGauge — SVG semicircle gauge.
 * overall_risk_score is now 0–100 (percentage), e.g. 6.09 = 6.09 %.
 * overall_risk field is gone; we derive colours from the score.
 */

import { useEffect, useRef } from 'react'
import type { PredictionResponse } from '../../types/prediction'
import {
  riskScoreToGaugeColor,
  scoreToOverallLabel,
  OVERALL_RISK_TEXT_CLASSES,
} from '../../utils/riskColors'

interface RiskGaugeProps {
  prediction: PredictionResponse
}

const RADIUS       = 45
const CX           = 60
const CY           = 60
const STROKE_WIDTH = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // 282.74

export function RiskGauge({ prediction }: RiskGaugeProps) {
  const arcRef = useRef<SVGCircleElement>(null)

  // Score is now 0-100; normalise to 0-1 for arc calculations
  const score       = prediction.overall_risk_score / 100
  const scorePercent = Math.round(prediction.overall_risk_score)

  const color      = riskScoreToGaugeColor(prediction.overall_risk_score)
  const label      = scoreToOverallLabel(prediction.overall_risk_score)
  const textClass  = OVERALL_RISK_TEXT_CLASSES[label]

  const halfCirc   = CIRCUMFERENCE / 2
  const filled     = score * halfCirc
  const dashArray  = `${filled} ${CIRCUMFERENCE - filled}`
  const dashOffset = -CIRCUMFERENCE * 0.25

  useEffect(() => {
    const arc = arcRef.current
    if (!arc) return
    arc.style.strokeDasharray = `0 ${CIRCUMFERENCE}`
    arc.style.transition = 'none'
    void arc.getBoundingClientRect()
    arc.style.transition = 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)'
    arc.style.strokeDasharray = dashArray
  }, [dashArray, score])

  return (
    <div>
      <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
        Overall Risk Score
      </p>
      <div className="flex flex-col items-center">
        <svg width="120" height="70" viewBox="0 0 120 70" className="overflow-visible">
          {/* Track arc */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none" stroke="#1e2d45" strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${halfCirc} ${halfCirc}`}
            strokeDashoffset={dashOffset} strokeLinecap="round"
          />
          {/* Filled arc */}
          <circle
            ref={arcRef}
            cx={CX} cy={CY} r={RADIUS}
            fill="none" stroke={color} strokeWidth={STROKE_WIDTH}
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
          {/* Score text */}
          <text x={CX} y={CY - 4} textAnchor="middle" fill={color}
            fontSize="18" fontFamily="JetBrains Mono" fontWeight="bold">
            {scorePercent}%
          </text>
          <text x="12"  y="68" fill="#475569" fontSize="8" fontFamily="JetBrains Mono">0%</text>
          <text x="100" y="68" fill="#475569" fontSize="8" fontFamily="JetBrains Mono">100%</text>
        </svg>
        <p className={`font-mono font-bold text-sm tracking-widest mt-1 ${textClass}`}>
          {label.toUpperCase()}
        </p>
      </div>
    </div>
  )
}
