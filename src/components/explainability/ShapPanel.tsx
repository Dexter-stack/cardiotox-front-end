import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Brain, Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { ExplainResponse, ThresholdLabel } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import { useExplainPrediction } from '../../hooks/usePrediction'
import { usePredictionStore } from '../../store/predictionStore'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

const LABEL_DISPLAY: Record<ThresholdLabel, string> = {
  tox_1: 'Strong Blocker (≤1 µM)',
  tox_5: 'Moderate Blocker (≤5 µM)',
  tox_10: 'Weak Blocker (≤10 µM)',
  tox_30: 'Very Weak Blocker (≤30 µM)',
}

function ShapTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as { name: string; value: number; direction: string }
  return (
    <div className="bg-bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-card">
      <p className="text-text-primary mb-0.5">{d.name}</p>
      <p className={d.direction === 'increases_risk' ? 'text-red-400' : 'text-emerald-400'}>
        SHAP: {d.value > 0 ? '+' : ''}{d.value.toFixed(4)}
      </p>
      <p className="text-text-muted">{d.direction === 'increases_risk' ? 'Increases risk' : 'Decreases risk'}</p>
    </div>
  )
}

interface ShapLabelChartProps {
  label: ThresholdLabel
  explanation: ExplainResponse
}

function ShapLabelChart({ label, explanation }: ShapLabelChartProps) {
  const values = explanation.shap_explanations?.[label]?.slice(0, 5) ?? []

  const data = values.map((v) => ({
    name: `Bit ${v.bit_index}`,
    value: v.shap_value,
    direction: v.direction,
    absValue: Math.abs(v.shap_value),
  }))

  const maxAbs = Math.max(...data.map((d) => d.absValue), 0.1)

  return (
    <div className="bg-bg-elevated rounded-lg p-3 border border-border/50">
      <p className="text-accent-cyan text-xs font-mono font-medium mb-3">
        {LABEL_DISPLAY[label]}
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" horizontal={false} />
          <XAxis
            type="number"
            domain={[-maxAbs, maxAbs]}
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={45}
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ShapTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={0} stroke="#1e2d45" strokeWidth={1} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} isAnimationActive maxBarSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.direction === 'increases_risk' ? '#ef4444' : '#10b981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ShapPanel() {
  const [open, setOpen] = useState(false)
  const { currentPrediction, currentExplanation, isExplaining } = usePredictionStore()
  const explain = useExplainPrediction()

  if (!currentPrediction) return null

  const handleLoad = () => {
    if (!currentExplanation && !isExplaining) {
      explain.mutate(currentPrediction.canonical_smiles)
    }
    setOpen(true)
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => (open ? setOpen(false) : handleLoad())}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-elevated/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Brain className="w-4 h-4 text-accent-cyan shrink-0" />
          <span className="text-text-primary text-sm font-medium">
            AI Explanation
          </span>
          <span className="text-text-muted text-xs font-mono hidden sm:inline">(SHAP TreeExplainer)</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/50">
              {isExplaining && (
                <div className="flex items-center justify-center gap-3 py-10 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />
                  <span className="font-mono text-sm">Computing SHAP values… (~200–500 ms)</span>
                </div>
              )}

              {!isExplaining && currentExplanation?.shap_explanations && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {THRESHOLD_META.map(({ label }) => (
                      <ShapLabelChart
                        key={label}
                        label={label}
                        explanation={currentExplanation}
                      />
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-bg-elevated/50 rounded-lg border border-border/40">
                    <p className="text-text-secondary text-xs leading-relaxed">
                      <span className="text-red-400 font-medium">Red bars</span> represent structural features (Morgan fingerprint bits)
                      associated with hERG channel binding — they push the model toward predicting toxicity.{' '}
                      <span className="text-emerald-400 font-medium">Green bars</span> represent features that suggest
                      the compound is unlikely to block hERG at that threshold. Values are SHAP (SHapley Additive exPlanations)
                      contributions from the XGBoost ensemble model.
                    </p>
                  </div>
                </>
              )}

              {!isExplaining && currentExplanation && !currentExplanation.shap_explanations && (
                <div className="text-center py-6 text-text-secondary text-sm font-mono">
                  Explainability data not available for this prediction.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
