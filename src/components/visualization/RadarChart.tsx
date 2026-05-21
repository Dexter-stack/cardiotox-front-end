import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { PredictionResponse } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface RadarChartProps {
  prediction: PredictionResponse
}

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as { label: string; value: number }
  return (
    <div className="bg-bg-card border border-border rounded-lg px-3 py-2 shadow-card text-xs font-mono">
      <p className="text-accent-cyan">{d.label}</p>
      <p className="text-text-secondary">
        Adj. Probability: <span className="text-text-primary">{d.value.toFixed(4)}</span>
      </p>
    </div>
  )
}

export function RadarChartPanel({ prediction }: RadarChartProps) {
  const data = THRESHOLD_META.map(({ key, micromolar }) => ({
    label: micromolar,
    value: prediction.predictions[key]?.adjusted_probability ?? 0,
  }))

  return (
    <div>
      <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
        Risk Radar Profile
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <RechartsRadar data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <PolarGrid stroke="#1e2d45" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          />
          <Radar
            name="Adj. Probability"
            dataKey="value"
            stroke="#00d4ff"
            fill="#00d4ff"
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
