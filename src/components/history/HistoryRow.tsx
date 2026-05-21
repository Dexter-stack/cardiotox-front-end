import { Clock, X } from 'lucide-react'
import type { HistoryEntry } from '../../types/prediction'
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

export function HistoryRow({ entry, isActive, onSelect, onRemove }: HistoryRowProps) {
  // Map the string overall_risk_label back to a RiskLevel for the badge
  const riskLevel = overallLabelToRiskLevel(entry.response.overall_risk_label)

  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
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
      aria-label={`History entry: ${entry.input}`}
    >
      {/* Clock icon */}
      <div className="shrink-0">
        <Clock className={`w-3 h-3 ${isActive ? 'text-accent-cyan' : 'text-text-muted'}`} />
      </div>

      {/* Input text + meta */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-mono truncate ${isActive ? 'text-accent-cyan' : 'text-text-primary'}`}
          title={entry.input}
        >
          {entry.input}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-text-muted text-xs">{formatTime(entry.timestamp)}</span>
          <span className="text-text-muted text-xs">·</span>
          <span className="text-text-muted text-xs uppercase tracking-wide font-mono">
            {entry.inputType}
          </span>
        </div>
      </div>

      {/* Risk badge + remove button */}
      <div className="flex items-center gap-2 shrink-0">
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
  )
}
