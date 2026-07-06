import { Clock, X, AlertTriangle } from 'lucide-react'
import type { HistoryEntry } from '../../types/prediction'
import { THRESHOLD_META } from '../../types/prediction'
import { RiskBadge } from '../results/RiskBadge'
import { overallLabelToRiskLevel } from '../../utils/riskColors'

interface HistoryRowProps {
  entry: HistoryEntry
  isActive: boolean
  onSelect: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const diff = Date.now() - ts
  if (diff < 60_000)      return 'Just now'
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`
  return d.toLocaleDateString()
}

function probColor(p: number): string {
  if (p < 0.20) return 'text-emerald-400'
  if (p < 0.40) return 'text-yellow-400'
  if (p < 0.60) return 'text-orange-400'
  return 'text-red-400'
}

export function HistoryRow({ entry, isActive, onSelect, onRemove }: HistoryRowProps) {
  const response = entry.response
  const riskLevel = overallLabelToRiskLevel(response.overall_risk_label)
  const score = response.overall_risk_score?.toFixed(1) ?? null
  const displayName = response.drug_name ?? entry.input

  return (
    <div
      className={`group relative flex flex-col gap-2 px-3 py-2.5 rounded-lg cursor-pointer
        transition-all border
        ${isActive
          ? 'bg-accent-cyan-glow border-accent-cyan/40'
          : 'bg-bg-elevated border-transparent hover:border-border hover:bg-bg-elevated/80'
        }`}
      onClick={() => onSelect(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(entry)}
      aria-selected={isActive}
      aria-label={`History entry: ${displayName}`}
    >
      {/* Row 1: icon + name + risk + remove */}
      <div className="flex items-center gap-2.5">
        <Clock className={`w-3 h-3 shrink-0 ${isActive ? 'text-accent-cyan' : 'text-text-muted'}`} />

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-mono truncate ${isActive ? 'text-accent-cyan' : 'text-text-primary'}`}
            title={displayName}
          >
            {displayName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-text-muted text-xs">{formatTime(entry.timestamp)}</span>
            <span className="text-text-muted text-xs">·</span>
            <span className="text-text-muted text-xs uppercase tracking-wide font-mono">
              {entry.inputType}
            </span>
            {response.low_confidence && (
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" aria-label="Low confidence" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {score && (
            <span className="font-mono text-[10px] text-text-muted tabular-nums hidden sm:inline">
              {score}
            </span>
          )}
          <RiskBadge risk={riskLevel} size="sm" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(entry.id) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded
              hover:text-red-400 text-text-muted"
            aria-label="Remove history entry"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Row 2: per-threshold probability pills (hidden until hover or active) */}
      {response.predictions && (
        <div className={`flex items-center gap-1.5 flex-wrap transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {THRESHOLD_META.map(({ key, short }) => {
            // Support both new (tox_1) and old (label-string) localStorage entries
            const result = response.predictions[key]
            if (!result) return null
            const p = result.probability
            return (
              <span
                key={key}
                className={`font-mono text-[9px] tabular-nums px-1.5 py-0.5 rounded
                  bg-bg-primary/60 ${probColor(p)}`}
              >
                {short} {(p * 100).toFixed(0)}%
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
