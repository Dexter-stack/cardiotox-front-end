import { History, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { HistoryEntry } from '../../types/prediction'
import { usePredictionStore } from '../../store/predictionStore'
import { HistoryRow } from './HistoryRow'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({ history, onSelect, onRemove, onClear }: HistoryPanelProps) {
  const { currentPrediction } = usePredictionStore()

  const activeId = history.find(
    (e) => e.response.canonical_smiles === currentPrediction?.canonical_smiles
  )?.id

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-elevated">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
            History
          </span>
          {history.length > 0 && (
            <span className="bg-bg-primary text-text-muted text-xs font-mono px-1.5 py-0.5 rounded">
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-text-muted hover:text-red-400 transition-colors text-xs font-mono"
            aria-label="Clear history"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-64 p-2 space-y-1 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-xs font-mono">
            No predictions yet
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryRow
                  entry={entry}
                  isActive={entry.id === activeId}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
