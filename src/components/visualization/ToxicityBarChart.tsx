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
import type { PredictionResponse } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import { RISK_COLORS, probabilityToColor } from '../../utils/riskColors'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface ToxicityBarChartProps {
  prediction: PredictionResponse
}

interface ChartDatum {
  label: string
  probability: number
  rawProbability: number
  risk: keyof typeof RISK_COLORS
}

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartDatum
  return (
    <div className="bg-bg-card border border-border rounded-lg px-4 py-3 shadow-card text-xs font-mono">
      <p className="text-accent-cyan font-semibold mb-1.5">{d.label}</p>
      <p className="text-text-secondary">
        Adjusted: <span className="text-text-primary">{d.probability.toFixed(4)}</span>
      </p>
      <p className="text-text-secondary">
        Raw: <span className="text-text-primary">{d.rawProbability.toFixed(4)}</span>
      </p>
      <p className="text-text-secondary mt-1">
        Risk: <span style={{ color: RISK_COLORS[d.risk] }}>{d.risk}</span>
      </p>
    </div>
  )
}

export function ToxicityBarChart({ prediction }: ToxicityBarChartProps) {
  const data: ChartDatum[] = THRESHOLD_META.map(({ key, micromolar }) => {
    const result = prediction.predictions[key]
    return {
      label: micromolar,
      probability: result?.adjusted_probability ?? 0,
      rawProbability: result?.raw_probability ?? 0,
      risk: (result?.risk_level ?? 'Minimal') as keyof typeof RISK_COLORS,
    }
  })

  return (
    <div>
      <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
        Toxicity Probability by Threshold
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1.0]}
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            y={0.5}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: 'Decision Threshold',
              position: 'insideTopRight',
              fill: '#ef4444',
              fontSize: 9,
              fontFamily: 'JetBrains Mono',
            }}
          />
          <Bar dataKey="probability" radius={[4, 4, 0, 0]} isAnimationActive maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={index} fill={probabilityToColor(entry.probability)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
