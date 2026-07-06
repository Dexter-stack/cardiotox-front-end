/**
 * RiskAssessment
 * Overall-risk panel.  overall_risk_score is now 0–100 (percentage).
 * overall_risk_label replaces the old overall_risk: RiskLevel field.
 */

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { ShieldAlert, TrendingUp, Microscope, Clock } from 'lucide-react'
import type { PredictionResponse, OverallRiskLabel } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import {
  OVERALL_RISK_COLORS,
  OVERALL_RISK_TEXT_CLASSES,
  OVERALL_INTERPRETATIONS,
  scoreToOverallLabel,
  RISK_COLORS,
} from '../../utils/riskColors'

interface RiskAssessmentProps {
  prediction: PredictionResponse
}

const TRACK_GRADIENT =
  'linear-gradient(90deg, #10b981 0%, #4ade80 18%, #eab308 35%, #f97316 60%, #ef4444 80%, #dc2626 100%)'

function AnimatedScore({ target }: { target: number }) {
  const motionVal = useMotionValue(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctrl = animate(motionVal, target, {
      duration: 1.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
    const unsub = motionVal.on('change', (v) => {
      if (spanRef.current) spanRef.current.textContent = v.toFixed(1)
    })
    return () => { ctrl.stop(); unsub() }
  }, [target, motionVal])

  return (
    <span className="flex items-baseline gap-1">
      <span ref={spanRef}>0.0</span>
      <span className="text-text-muted font-mono text-sm font-normal">/ 100</span>
    </span>
  )
}

interface ThresholdPillProps {
  label: string
  prediction: boolean
  prob: number
  color: string
}

function ThresholdPill({ label, prediction, prob, color }: ThresholdPillProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-2.5 rounded-lg bg-bg-elevated border border-border/60 min-w-[60px] sm:min-w-[68px]">
      <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest leading-none">{label}</span>
      <span className={`text-[10px] font-mono font-bold mt-0.5 ${prediction ? 'text-red-400' : 'text-emerald-400'}`}>
        {prediction ? 'TOXIC' : 'SAFE'}
      </span>
      <span className="font-mono text-[10px] tabular-nums" style={{ color }}>
        {(prob * 100).toFixed(1)}%
      </span>
    </div>
  )
}

export function RiskAssessment({ prediction }: RiskAssessmentProps) {
  const score = prediction.overall_risk_score

  const overallLabel: OverallRiskLabel =
    (['Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'].includes(prediction.overall_risk_label)
      ? prediction.overall_risk_label
      : scoreToOverallLabel(score)) as OverallRiskLabel

  const accentColor = OVERALL_RISK_COLORS[overallLabel]
  const textClass   = OVERALL_RISK_TEXT_CLASSES[overallLabel]
  const interpretation = OVERALL_INTERPRETATIONS[overallLabel]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: `${accentColor}35` }}
    >
      {/* ── Top band ───────────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap gap-3 sm:gap-4 items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${accentColor}14 0%, ${accentColor}06 100%)` }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border"
            style={{ background: `${accentColor}18`, borderColor: `${accentColor}40`, boxShadow: `0 0 16px ${accentColor}25` }}
          >
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.15em] mb-0.5">
              Overall Risk Assessment
            </p>
            <p className={`text-lg sm:text-2xl font-mono font-bold tracking-wider ${textClass}`}>
              {overallLabel.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-0.5">Risk Score</p>
          <p className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${textClass}`}>
            <AnimatedScore target={score} />
          </p>
        </div>
      </div>

      <div className="bg-bg-card divide-y divide-border/40">

        {/* ── Gradient score bar ─────────────────────────────────── */}
        <div className="px-4 sm:px-6 pt-4 pb-5">
          <div className="relative">
            <div className="h-3 rounded-full" style={{ background: TRACK_GRADIENT, opacity: 0.22 }} />
            <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.0, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ background: TRACK_GRADIENT, boxShadow: `0 0 10px ${accentColor}55` }}
              />
            </div>
            {[25, 50, 75].map((pct) => (
              <div key={pct} className="absolute top-0 bottom-0 w-px bg-bg-primary/60" style={{ left: `${pct}%` }} />
            ))}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-bg-primary z-10"
              initial={{ left: '0%' }}
              animate={{ left: `${score}%` }}
              transition={{ duration: 1.0, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}88` }}
            />
          </div>

          {/* Zone labels */}
          <div className="flex justify-between mt-2.5 px-0.5">
            {[
              { label: 'Low',      color: '#10b981' },
              { label: 'Moderate', color: '#eab308' },
              { label: 'High',     color: '#f97316' },
              { label: 'Critical', color: '#dc2626' },
            ].map(({ label, color }) => (
              <span key={label} className="text-[8px] sm:text-[9px] font-mono font-medium tracking-wider uppercase" style={{ color }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Scientific interpretation ──────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 flex items-start gap-3">
          <Microscope className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-1.5">
              Scientific Interpretation
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">{interpretation}</p>
          </div>
        </div>

        {/* ── Per-threshold mini summary ─────────────────────────── */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Threshold Breakdown</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {THRESHOLD_META.map(({ key, short }) => {
              const r = prediction.predictions[key]
              if (!r) return null
              return (
                <ThresholdPill
                  key={key}
                  label={short}
                  prediction={r.prediction}
                  prob={r.probability}
                  color={RISK_COLORS[r.risk_level]}
                />
              )
            })}

            {/* Overall pill */}
            <div
              className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-2.5 rounded-lg border min-w-[60px] sm:min-w-[68px]"
              style={{ background: `${accentColor}12`, borderColor: `${accentColor}35` }}
            >
              <span className="text-[9px] font-mono uppercase tracking-widest leading-none" style={{ color: accentColor }}>
                Overall
              </span>
              <span className={`text-[11px] font-mono font-bold mt-0.5 ${textClass}`}>
                {overallLabel.split(' ')[0].toUpperCase()}
              </span>
              <span className="font-mono text-[10px] tabular-nums" style={{ color: accentColor }}>
                {score}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer metadata ────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-2.5 bg-bg-elevated/30 flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] font-mono text-text-muted">
              Processed in <span className="text-text-secondary">{prediction.processing_time_ms.toFixed(1)} ms</span>
            </span>
          </div>
          <span className="text-text-muted/40 text-xs hidden sm:inline">·</span>
          <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
            Probabilities: <span className="text-accent-cyan">Threshold-adjusted</span>
          </span>
          {prediction.monotonicity_enforced && (
            <>
              <span className="text-text-muted/40 text-xs hidden sm:inline">·</span>
              <span className="text-[10px] font-mono text-text-muted">
                Monotonicity: <span className="text-emerald-400">Enforced</span>
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
