import { motion } from 'framer-motion'
import { X, Tag } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import type { PredictionRecord } from '../../types/adminTypes'

interface PredictionDetailDrawerProps {
  prediction: PredictionRecord
  onClose: () => void
  onLabel: () => void
}

function probTextClass(p: number): string {
  if (p < 0.20) return 'text-emerald-400'
  if (p < 0.50) return 'text-yellow-400'
  if (p < 0.75) return 'text-orange-400'
  return 'text-red-400'
}

function probHex(p: number): string {
  if (p < 0.20) return '#34d399'
  if (p < 0.50) return '#facc15'
  if (p < 0.75) return '#fb923c'
  return '#f87171'
}

function riskBadgeClass(label: string): string {
  const l = label.toLowerCase()
  if (l === 'low')      return 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40'
  if (l === 'moderate') return 'text-yellow-300 border-yellow-700/50 bg-yellow-950/40'
  if (l === 'high')     return 'text-orange-300 border-orange-700/50 bg-orange-950/40'
  return 'text-red-300 border-red-700/50 bg-red-950/40'
}

export function PredictionDetailDrawer({ prediction: p, onClose, onLabel }: PredictionDetailDrawerProps) {
  const chartData = [
    { threshold: '≤1µM',  raw: +(p.raw_probabilities.tox_1  * 100).toFixed(1), calibrated: +(p.tox_1.probability  * 100).toFixed(1) },
    { threshold: '≤5µM',  raw: +(p.raw_probabilities.tox_5  * 100).toFixed(1), calibrated: +(p.tox_5.probability  * 100).toFixed(1) },
    { threshold: '≤10µM', raw: +(p.raw_probabilities.tox_10 * 100).toFixed(1), calibrated: +(p.tox_10.probability * 100).toFixed(1) },
    { threshold: '≤30µM', raw: +(p.raw_probabilities.tox_30 * 100).toFixed(1), calibrated: +(p.tox_30.probability * 100).toFixed(1) },
  ]

  const thresholds = [
    { label: '≤1 µM',  raw: p.raw_probabilities.tox_1,  cal: p.tox_1.probability,  pred: p.tox_1.prediction  },
    { label: '≤5 µM',  raw: p.raw_probabilities.tox_5,  cal: p.tox_5.probability,  pred: p.tox_5.prediction  },
    { label: '≤10 µM', raw: p.raw_probabilities.tox_10, cal: p.tox_10.probability, pred: p.tox_10.prediction },
    { label: '≤30 µM', raw: p.raw_probabilities.tox_30, cal: p.tox_30.probability, pred: p.tox_30.prediction },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-bg-card border-l border-border
          flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-text-primary font-semibold text-sm">
              {p.drug_name ?? 'Unknown Compound'}
            </p>
            <p className="text-text-muted font-mono text-[10px] mt-0.5">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* SMILES */}
          <div className="bg-bg-elevated rounded-lg px-4 py-3 space-y-1">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Canonical SMILES</p>
            <p className="text-accent-cyan font-mono text-xs break-all">{p.canonical_smiles}</p>
          </div>

          {/* Molecular info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-elevated rounded-lg px-4 py-3">
              <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-1">Formula</p>
              <p className="text-text-primary font-mono text-sm">{p.molecular_formula}</p>
            </div>
            <div className="bg-bg-elevated rounded-lg px-4 py-3">
              <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-1">Mol. Weight</p>
              <p className="text-text-primary font-mono text-sm">{p.molecular_weight.toFixed(2)} g/mol</p>
            </div>
          </div>

          {/* Overall risk */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-mono border ${riskBadgeClass(p.overall_risk_label)}`}>
              {p.overall_risk_label}
            </span>
            <span className={`font-mono font-bold text-xl tabular-nums ${probTextClass(p.overall_risk_score / 100)}`}>
              {p.overall_risk_score.toFixed(1)} <span className="text-text-muted text-sm font-normal">/ 100</span>
            </span>
            <span className="text-text-muted font-mono text-xs">overall risk score</span>
          </div>

          {/* Raw vs calibrated chart */}
          <div>
            <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
              Raw vs. Calibrated Probabilities
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
                  <XAxis
                    dataKey="threshold"
                    tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'monospace' }}
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e2433',
                      border: '1px solid #2d3548',
                      borderRadius: 8,
                      fontFamily: 'monospace',
                      fontSize: 11,
                    }}
                    formatter={(value: number) => [`${value}%`]}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Bar dataKey="raw" name="Raw" fill="#4b5563" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="calibrated" name="Calibrated" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.threshold} fill={probHex(entry.calibrated / 100)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-threshold breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {thresholds.map(({ label, raw, cal, pred }) => (
              <div key={label} className="bg-bg-elevated rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-text-muted text-[10px] font-mono">{label}</p>
                  <span className={`text-[10px] font-mono ${pred ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pred ? 'Blocker' : 'Non-Blocker'}
                  </span>
                </div>
                <p className={`font-mono text-sm font-medium ${probTextClass(cal)}`}>
                  {(cal * 100).toFixed(1)}%
                </p>
                <p className="text-text-muted font-mono text-[10px]">raw: {(raw * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>

          {/* Calibration info */}
          <div className="bg-bg-elevated rounded-lg px-4 py-3 space-y-2">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Calibration</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-text-muted">Method: </span>
                <span className="text-text-secondary">{p.calibration_method}</span>
              </div>
              <div>
                <span className="text-text-muted">Distortion: </span>
                <span className="text-text-secondary">{(p.calibration_distortion * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-text-muted">Monotonicity: </span>
                <span className={p.monotonicity_enforced ? 'text-amber-400' : 'text-text-secondary'}>
                  {p.monotonicity_enforced ? 'Enforced' : 'Natural'}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Processing: </span>
                <span className="text-text-secondary">{p.processing_time_ms}ms</span>
              </div>
            </div>
          </div>

          {/* Source + ID */}
          <div className="space-y-1 text-xs font-mono text-text-muted">
            <div className="flex gap-2">
              <span>Source:</span>
              <span className="text-text-secondary">
                {p.source === 'smiles_input' ? 'SMILES Input' : p.source === 'drug_name' ? 'Drug Name Lookup' : 'Batch Upload'}
              </span>
            </div>
            <div className="flex gap-2">
              <span>ID:</span>
              <span className="text-text-secondary truncate">{p.id}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={onLabel}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
              bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
              hover:bg-cyan-400 transition-all"
          >
            <Tag className="w-4 h-4" />
            Label This Prediction
          </button>
        </div>
      </motion.aside>
    </>
  )
}
