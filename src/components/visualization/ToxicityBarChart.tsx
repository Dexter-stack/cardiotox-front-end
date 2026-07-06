import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts'
import type { PredictionResponse } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import { getRiskColor, formatProbability } from '../../utils/formatters'
import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface ToxicityBarChartProps {
  prediction: PredictionResponse
}

interface ChartDatum {
  label: string          // "≤1 µM"
  value: number          // probability × 100
  riskLevel: string
  isToxic: boolean
  thresholdLabel: string // "Minimal", "Low", etc.
}

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartDatum
  return (
    <div className="bg-bg-card border border-border rounded-lg px-4 py-3 shadow-card text-xs font-mono">
      <p className="font-semibold mb-1.5" style={{ color: getRiskColor(d.riskLevel) }}>
        {d.label}: {d.value.toFixed(1)}%
        <span className="ml-1.5 text-text-muted font-normal">— {d.riskLevel}</span>
      </p>
      <p className={`font-medium ${d.isToxic ? 'text-red-400' : 'text-emerald-400'}`}>
        Prediction: {d.isToxic ? 'TOXIC ✗' : 'Non-Toxic ✓'}
      </p>
    </div>
  )
}

function ToxicLabel({ x, y, width, payload }: {
  x?: number; y?: number; width?: number; payload?: ChartDatum
}) {
  if (!payload?.isToxic) return null
  return (
    <text
      x={(x ?? 0) + (width ?? 0) / 2}
      y={(y ?? 0) - 5}
      textAnchor="middle"
      fill="#ef4444"
      fontSize={8}
      fontFamily="JetBrains Mono"
      fontWeight="bold"
    >
      TOXIC
    </text>
  )
}

export function ToxicityBarChart({ prediction }: ToxicityBarChartProps) {
  const data: ChartDatum[] = THRESHOLD_META.map(({ key, micromolar }) => {
    const result = prediction.predictions[key]
    return {
      label:          micromolar,
      value:          (result?.probability ?? 0) * 100,
      riskLevel:      result?.risk_level ?? 'Minimal',
      isToxic:        result?.prediction ?? false,
      thresholdLabel: result?.risk_level ?? 'Minimal',
    }
  })

  return (
    <div>
      <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
        Toxicity Probability by Threshold
      </p>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            y={50}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: 'Decision boundary (50%)',
              position: 'insideTopRight',
              fill: '#ef444488',
              fontSize: 9,
              fontFamily: 'JetBrains Mono',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive maxBarSize={60}>
            <LabelList content={<ToxicLabel />} />
            {data.map((entry, index) => (
              <Cell key={index} fill={getRiskColor(entry.riskLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
