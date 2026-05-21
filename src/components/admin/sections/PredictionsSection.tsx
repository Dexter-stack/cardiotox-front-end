import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, X, Loader2, RefreshCw, ChevronLeft, ChevronRight, Tag, Eye } from 'lucide-react'
import { getPredictions } from '../../../api/adminClient'
import { FeedbackModal } from '../modals/FeedbackModal'
import { PredictionDetailDrawer } from '../PredictionDetailDrawer'
import type { PredictionsFilter, PredictionRecord } from '../../../types/adminTypes'

const SOURCE_OPTIONS = [
  { value: '',            label: 'All Sources'  },
  { value: 'smiles_input', label: 'SMILES Input' },
  { value: 'drug_name',   label: 'Drug Name'    },
  { value: 'batch',       label: 'Batch Upload' },
]

const RISK_OPTIONS = [
  { value: '',          label: 'All Risks'  },
  { value: 'Low',       label: 'Low'        },
  { value: 'Moderate',  label: 'Moderate'   },
  { value: 'High',      label: 'High'       },
  { value: 'Very High', label: 'Very High'  },
]

function probTextClass(p: number): string {
  if (p < 0.20) return 'text-emerald-400'
  if (p < 0.50) return 'text-yellow-400'
  if (p < 0.75) return 'text-orange-400'
  return 'text-red-400'
}

function riskBadgeClass(label: string): string {
  const l = label.toLowerCase()
  if (l === 'low')      return 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40'
  if (l === 'moderate') return 'text-yellow-300 border-yellow-700/50 bg-yellow-950/40'
  if (l === 'high')     return 'text-orange-300 border-orange-700/50 bg-orange-950/40'
  return 'text-red-300 border-red-700/50 bg-red-950/40'
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  )
}

const LIMIT = 20

export function PredictionsSection() {
  const qc = useQueryClient()

  const [draftSource,   setDraftSource]   = useState('')
  const [draftRisk,     setDraftRisk]     = useState('')
  const [draftDrugName, setDraftDrugName] = useState('')

  const [filters, setFilters] = useState<PredictionsFilter>({ limit: LIMIT, offset: 0 })

  const [detailTarget, setDetailTarget] = useState<PredictionRecord | null>(null)
  const [labelTarget,  setLabelTarget]  = useState<PredictionRecord | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-predictions', filters],
    queryFn:  () => getPredictions(filters),
  })

  const applyFilters = () => {
    setFilters({
      limit:      LIMIT,
      offset:     0,
      source:     draftSource   || undefined,
      risk_label: draftRisk     || undefined,
      drug_name:  draftDrugName.trim() || undefined,
    })
  }

  const clearFilters = () => {
    setDraftSource('')
    setDraftRisk('')
    setDraftDrugName('')
    setFilters({ limit: LIMIT, offset: 0 })
  }

  const totalPages  = data ? Math.ceil(data.total / LIMIT) : 0
  const currentPage = data ? Math.floor(filters.offset / LIMIT) + 1 : 1

  const goPage = (page: number) =>
    setFilters((f) => ({ ...f, offset: (page - 1) * LIMIT }))

  const openLabel = (row: PredictionRecord) => {
    setDetailTarget(null)
    setLabelTarget(row)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary font-semibold text-base">Prediction History</h2>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            {data ? `${data.total.toLocaleString()} total predictions` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['admin-predictions'] })}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary font-mono text-xs transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Source</label>
          <select
            value={draftSource}
            onChange={(e) => setDraftSource(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-xs
              focus:outline-none focus:border-accent-cyan transition-colors"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Risk Label</label>
          <select
            value={draftRisk}
            onChange={(e) => setDraftRisk(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-xs
              focus:outline-none focus:border-accent-cyan transition-colors"
          >
            {RISK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Drug Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={draftDrugName}
              onChange={(e) => setDraftDrugName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search drug name…"
              className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-4 py-2
                text-text-primary font-mono text-xs placeholder:text-text-muted
                focus:outline-none focus:border-accent-cyan transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-cyan text-bg-primary
              font-mono font-semibold text-xs hover:bg-cyan-400 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-elevated border border-border
              text-text-secondary hover:text-text-primary font-mono text-xs transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-400 font-mono text-sm">Failed to load predictions.</div>
        ) : !data?.results.length ? (
          <div className="py-12 text-center text-text-muted font-mono text-sm">No predictions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 860 }} role="table">
              <thead>
                <tr className="border-b border-border bg-bg-elevated">
                  {['Date/Time', 'Drug Name', 'SMILES', 'Risk', 'Score', 'Tox1', 'Tox5', 'Tox10', 'Tox30', 'Source', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-3 text-text-muted font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.results.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 last:border-0 hover:bg-bg-elevated/40 transition-colors"
                  >
                    <td className="px-3 py-3 text-text-secondary font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-3 py-3 text-text-primary font-mono text-xs max-w-[120px] truncate" title={row.drug_name ?? undefined}>
                      {row.drug_name ?? <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-3 py-3 text-accent-cyan font-mono text-[11px] max-w-[140px] truncate" title={row.canonical_smiles}>
                      {row.canonical_smiles}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono border ${riskBadgeClass(row.overall_risk_label)}`}>
                        {row.overall_risk_label}
                      </span>
                    </td>
                    <td className={`px-3 py-3 font-mono text-xs font-medium ${probTextClass(row.overall_risk_score)}`}>
                      {(row.overall_risk_score * 100).toFixed(0)}%
                    </td>
                    <td className={`px-3 py-3 font-mono text-xs ${probTextClass(row.tox_1.probability)}`}>
                      {(row.tox_1.probability * 100).toFixed(0)}%
                    </td>
                    <td className={`px-3 py-3 font-mono text-xs ${probTextClass(row.tox_5.probability)}`}>
                      {(row.tox_5.probability * 100).toFixed(0)}%
                    </td>
                    <td className={`px-3 py-3 font-mono text-xs ${probTextClass(row.tox_10.probability)}`}>
                      {(row.tox_10.probability * 100).toFixed(0)}%
                    </td>
                    <td className={`px-3 py-3 font-mono text-xs ${probTextClass(row.tox_30.probability)}`}>
                      {(row.tox_30.probability * 100).toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-text-muted font-mono text-[11px] whitespace-nowrap">
                      {row.source === 'smiles_input' ? 'SMILES' : row.source === 'drug_name' ? 'Drug' : 'Batch'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDetailTarget(row)}
                          title="View details"
                          className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-cyan transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setLabelTarget(row)}
                          title="Label prediction"
                          className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-violet-400 transition-colors"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-mono text-text-muted">
          <span>
            Showing {filters.offset + 1}–{Math.min(filters.offset + LIMIT, data.total)} of {data.total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3">Page {currentPage} / {totalPages}</span>
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer + Modal */}
      <AnimatePresence>
        {detailTarget && (
          <PredictionDetailDrawer
            prediction={detailTarget}
            onClose={() => setDetailTarget(null)}
            onLabel={() => openLabel(detailTarget)}
          />
        )}
        {labelTarget && (
          <FeedbackModal prediction={labelTarget} onClose={() => setLabelTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
