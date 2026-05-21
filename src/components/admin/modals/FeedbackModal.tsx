/**
 * FeedbackModal — label a prediction for model retraining.
 * Can be used standalone (modal overlay) or embedded (no overlay wrapper).
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertTriangle, Tag } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { submitFeedback, getFeedback } from '../../../api/adminClient'
import type { PredictionRecord } from '../../../types/adminTypes'

type VerifiedValue = boolean | null

interface FeedbackModalProps {
  prediction: PredictionRecord
  onClose: () => void
}

const THRESHOLDS: { key: 'verified_tox_1' | 'verified_tox_5' | 'verified_tox_10' | 'verified_tox_30'; label: string }[] = [
  { key: 'verified_tox_1',  label: 'Strong Blocker (≤1 µM)'     },
  { key: 'verified_tox_5',  label: 'Moderate Blocker (≤5 µM)'   },
  { key: 'verified_tox_10', label: 'Weak Blocker (≤10 µM)'      },
  { key: 'verified_tox_30', label: 'Very Weak Blocker (≤30 µM)' },
]

const RADIO_OPTIONS: { value: VerifiedValue; label: string; color: string }[] = [
  { value: true,  label: 'Confirmed Blocker',     color: 'text-red-400'     },
  { value: false, label: 'Confirmed Non-Blocker',  color: 'text-emerald-400' },
  { value: null,  label: 'Unsure (skip)',          color: 'text-text-muted'  },
]

export function FeedbackModal({ prediction, onClose }: FeedbackModalProps) {
  const [values, setValues] = useState<Record<string, VerifiedValue>>({
    verified_tox_1:  null,
    verified_tox_5:  null,
    verified_tox_10: null,
    verified_tox_30: null,
  })
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [noFingerprint, setNoFingerprint] = useState(false)

  // Load existing feedback
  const { data: existing } = useQuery({
    queryKey: ['feedback', prediction.id],
    queryFn: () => getFeedback(prediction.id),
    retry: false,
  })

  useEffect(() => {
    if (existing) {
      setValues({
        verified_tox_1:  existing.verified_tox_1,
        verified_tox_5:  existing.verified_tox_5,
        verified_tox_10: existing.verified_tox_10,
        verified_tox_30: existing.verified_tox_30,
      })
      setNotes(existing.notes ?? '')
    }
  }, [existing])

  const mut = useMutation({
    mutationFn: () =>
      submitFeedback(prediction.id, {
        verified_tox_1:  values.verified_tox_1  as boolean | null,
        verified_tox_5:  values.verified_tox_5  as boolean | null,
        verified_tox_10: values.verified_tox_10 as boolean | null,
        verified_tox_30: values.verified_tox_30 as boolean | null,
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => setSaved(true),
    onError: (err) => {
      if ((err as { error_code?: string })?.error_code === 'NO_FINGERPRINT') {
        setNoFingerprint(true)
      }
    },
  })

  const setField = (key: string, val: VerifiedValue) =>
    setValues((prev) => ({ ...prev, [key]: val }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-lg bg-bg-card border border-border rounded-2xl shadow-card overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent-cyan" />
            <span className="text-text-primary font-semibold text-sm">Label Prediction</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Compound info */}
          <div className="bg-bg-elevated rounded-lg px-4 py-3 space-y-1">
            {prediction.drug_name && (
              <p className="text-text-primary font-mono text-sm font-medium">{prediction.drug_name}</p>
            )}
            <p className="text-accent-cyan font-mono text-xs truncate" title={prediction.canonical_smiles}>
              {prediction.canonical_smiles}
            </p>
          </div>

          {/* Existing feedback notice */}
          {existing && (
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Updating existing labels from {new Date(existing.created_at).toLocaleDateString()}
            </div>
          )}

          {/* No fingerprint warning */}
          {noFingerprint && (
            <div className="flex items-start gap-2 bg-amber-950/50 border border-amber-700/50
              rounded-lg px-4 py-3 text-amber-300 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              This prediction has no stored fingerprint and cannot be used for retraining.
              Only predictions made after 2026-05-21 have fingerprints.
            </div>
          )}

          {/* Success banner */}
          {saved && (
            <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-700/50
              rounded-lg px-4 py-3 text-emerald-300 text-sm font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Labels saved successfully
            </div>
          )}

          {/* Error banner */}
          {mut.isError && !noFingerprint && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-2.5 text-red-300 text-xs font-mono">
              {(mut.error as { message?: string })?.message ?? 'Failed to save labels.'}
            </div>
          )}

          {/* Threshold radio groups */}
          <div className="space-y-4">
            {THRESHOLDS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <p className="text-text-secondary text-xs font-mono font-medium">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {RADIO_OPTIONS.map(({ value, label: optLabel, color }) => {
                    const selected = values[key] === value
                    return (
                      <button
                        key={String(value)}
                        onClick={() => setField(key, value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-mono text-xs
                          ${selected
                            ? `${color} border-current bg-current/10`
                            : 'text-text-muted border-border hover:border-border-bright hover:text-text-secondary'
                          }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center shrink-0
                          ${selected ? 'border-current' : 'border-text-muted'}`}>
                          {selected && <span className="w-1 h-1 rounded-full bg-current" />}
                        </span>
                        {optLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
              Notes <span className="text-text-muted normal-case tracking-normal">— optional</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed via patch-clamp assay"
              rows={3}
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3
                text-text-primary font-mono text-sm placeholder:text-text-muted resize-none
                focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-bg-elevated border border-border
              text-text-secondary hover:text-text-primary font-mono text-sm transition-colors"
          >
            {saved ? 'Close' : 'Cancel'}
          </button>
          {!saved && (
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
                hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Labels'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
