import { useOutletContext } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Cpu, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { retrainModel, getPredictions } from '../../../api/adminClient'
import type { RetrainResult } from '../../../types/adminTypes'
import type { AdminInfo } from '../../../types/access'

export function ModelSection() {
  const { admin } = useOutletContext<{ admin: AdminInfo }>()

  const { data: statsData } = useQuery({
    queryKey: ['admin-predictions-count'],
    queryFn:  () => getPredictions({ limit: 1, offset: 0 }),
  })

  const mut = useMutation<RetrainResult>({
    mutationFn: retrainModel,
  })

  const result = mut.data

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-text-primary font-semibold text-base">Model Retraining</h2>
        <p className="text-text-muted text-xs font-mono mt-0.5">
          Retrain the hERG prediction model using verified labels from the feedback queue
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest mb-2">Total Predictions</p>
          <p className="text-text-primary font-mono font-bold text-3xl">
            {statsData ? statsData.total.toLocaleString() : '—'}
          </p>
          <p className="text-text-muted font-mono text-xs mt-1">stored in history</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Model</p>
          </div>
          <p className="text-text-primary font-mono font-bold text-lg">
            {result?.model_version ?? 'hERG-XGB v1'}
          </p>
          <p className="text-text-muted font-mono text-xs mt-1">
            {result?.retrained_at
              ? `Last retrained ${new Date(result.retrained_at).toLocaleDateString()}`
              : 'Multi-label XGBoost + Isotonic calibration'
            }
          </p>
        </div>
      </div>

      {/* Requirements info */}
      <div className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
        <p className="text-text-secondary text-xs font-mono uppercase tracking-widest">Retraining Requirements</p>
        <ul className="space-y-2 text-xs font-mono text-text-secondary">
          {[
            'Predictions must have stored molecular fingerprints (after 2026-05-21)',
            'Each prediction must have at least one verified label (Confirmed Blocker or Non-Blocker)',
            'Unsure / skip labels are excluded from training data',
            'Minimum labeled samples required before training begins',
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent-cyan mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error banner */}
      {mut.isError && (
        <div className="flex items-start gap-2 bg-red-950/50 border border-red-700/50
          rounded-xl px-5 py-4 text-red-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Retraining failed</p>
            <p className="text-red-400/80 mt-0.5">
              {(mut.error as { message?: string })?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className={`rounded-xl border px-5 py-4 space-y-3 text-xs font-mono
          ${result.success
            ? 'bg-emerald-950/40 border-emerald-700/50'
            : 'bg-amber-950/40 border-amber-700/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              : <AlertTriangle className="w-4 h-4 text-amber-400" />
            }
            <span className={result.success ? 'text-emerald-300' : 'text-amber-300'}>
              {result.message}
            </span>
          </div>

          {result.success && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-text-muted">Samples used</p>
                <p className="text-text-primary font-medium mt-0.5">{result.samples_used}</p>
              </div>
              <div>
                <p className="text-text-muted">Model version</p>
                <p className="text-text-primary font-medium mt-0.5">{result.model_version ?? '—'}</p>
              </div>
              {Object.entries(result.labels_updated).length > 0 && (
                <div className="col-span-2">
                  <p className="text-text-muted mb-1">Labels used</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.labels_updated).map(([key, count]) => (
                      <span key={key} className="px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-secondary">
                        {key}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.labels_skipped.length > 0 && (
                <div className="col-span-2">
                  <p className="text-amber-400/80">
                    {result.labels_skipped.length} prediction(s) skipped (no fingerprint)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Retrain button — superadmin only */}
      {admin.is_superadmin ? (
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-cyan text-bg-primary
            font-mono font-semibold text-sm hover:bg-cyan-400
            disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow-cyan-sm"
        >
          {mut.isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Retraining…</>
            : <><RefreshCw className="w-4 h-4" /> {result?.success ? 'Retrain Again' : 'Start Retraining'}</>
          }
        </button>
      ) : (
        <p className="text-text-muted font-mono text-xs">
          Only superadmins can trigger model retraining.
        </p>
      )}
    </div>
  )
}
