/**
 * PredictionCard
 * compound identity bar → calibration strip → PredictionTable → RiskAssessment → Model Info
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, Scale, Dna, ExternalLink, ChevronDown, ChevronUp, Cpu } from 'lucide-react'
import type { PredictionResponse, CalibrationMethod } from '../../types/prediction'
import { PredictionTable } from './PredictionTable'
import { RiskAssessment } from './RiskAssessment'

interface PredictionCardProps {
  prediction: PredictionResponse
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  smiles_input: { label: 'SMILES Input',        color: 'text-accent-cyan   border-accent-cyan/30   bg-accent-cyan-glow'  },
  drug_name:    { label: 'Drug Name → PubChem', color: 'text-violet-300    border-violet-700/40    bg-violet-950/40'     },
  batch:        { label: 'Batch Upload',         color: 'text-amber-300     border-amber-700/40     bg-amber-950/40'      },
}

const CALIBRATION_LABELS: Record<CalibrationMethod, string> = {
  none:                'No Correction Needed',
  isotonic_regression: 'Isotonic Regression',
  isotonic_sorted:     'Sorted Rearrangement',
}

const CALIBRATION_COLORS: Record<CalibrationMethod, string> = {
  none:                'text-emerald-300 border-emerald-700/40 bg-emerald-950/40',
  isotonic_regression: 'text-accent-cyan  border-accent-cyan/30  bg-accent-cyan-glow',
  isotonic_sorted:     'text-violet-300   border-violet-700/40   bg-violet-950/40',
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const [modelInfoOpen, setModelInfoOpen] = useState(false)
  const source = SOURCE_LABELS[prediction.resolved_from] ?? SOURCE_LABELS.smiles_input

  const calibLabel = CALIBRATION_LABELS[prediction.calibration_method] ?? prediction.calibration_method
  const calibColor = CALIBRATION_COLORS[prediction.calibration_method] ?? CALIBRATION_COLORS.none
  const hasDistortion = prediction.calibration_distortion > 0

  return (
    <motion.div
      key={prediction.canonical_smiles}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* ── Compound identity bar ────────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-xl px-5 py-4">
        <div className="flex flex-wrap gap-5 items-start">

          {/* Canonical SMILES */}
          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1
              flex items-center gap-1.5">
              <FlaskConical className="w-3 h-3 shrink-0" />
              Canonical SMILES
            </p>
            <p
              className="font-mono text-accent-cyan text-sm truncate leading-snug"
              title={prediction.canonical_smiles}
            >
              {prediction.canonical_smiles}
            </p>
          </div>

          {/* Molecular formula */}
          <div className="shrink-0">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1
              flex items-center gap-1.5">
              <Dna className="w-3 h-3 shrink-0" />
              Formula
            </p>
            <p className="font-mono text-text-primary text-sm leading-snug">
              {prediction.molecular_formula}
            </p>
          </div>

          {/* Molecular weight */}
          <div className="shrink-0">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1
              flex items-center gap-1.5">
              <Scale className="w-3 h-3 shrink-0" />
              Mol. Weight
            </p>
            <p className="font-mono text-text-primary text-sm leading-snug">
              {prediction.molecular_weight.toFixed(2)}
              <span className="text-text-muted ml-1 text-[10px]">g/mol</span>
            </p>
          </div>

          {/* Source badge */}
          <div className="shrink-0">
            <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1">
              Source
            </p>
            <span
              className={`inline-flex items-center rounded border px-2.5 py-0.5
                text-[10px] font-mono font-medium ${source.color}`}
            >
              {source.label}
            </span>
          </div>
        </div>

        {/* PubChem details row (drug name resolution only) */}
        {prediction.pubchem_cid && (
          <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center gap-4
            text-xs font-mono text-text-secondary">
            <span>
              PubChem CID:{' '}
              <span className="text-text-primary">{prediction.pubchem_cid}</span>
            </span>
            {prediction.resolved_smiles && (
              <span className="truncate max-w-xs" title={prediction.resolved_smiles}>
                Resolved SMILES:{' '}
                <span className="text-accent-cyan">{prediction.resolved_smiles.slice(0, 48)}…</span>
              </span>
            )}
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${prediction.pubchem_cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent-cyan hover:text-cyan-300 transition-colors ml-auto"
              aria-label="Open on PubChem"
            >
              <ExternalLink className="w-3 h-3" />
              PubChem
            </a>
          </div>
        )}
      </div>

      {/* ── Calibration strip ────────────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-xl px-5 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em]">
            Calibration
          </span>
          <span className={`inline-flex items-center rounded border px-2.5 py-0.5 text-[10px] font-mono font-medium ${calibColor}`}>
            {calibLabel}
          </span>
        </div>
        {hasDistortion && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-text-muted">Distortion</span>
            <span className="text-text-secondary tabular-nums">
              {prediction.calibration_distortion.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* ── Per-threshold prediction table ───────────────────────── */}
      <PredictionTable prediction={prediction} />

      {/* ── Overall risk assessment panel ────────────────────────── */}
      <RiskAssessment prediction={prediction} />

      {/* ── Model Info collapsible ───────────────────────────────── */}
      {prediction.model_metadata && (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setModelInfoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-bg-elevated/50 transition-colors"
            aria-expanded={modelInfoOpen}
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
              <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
                Model Info
              </span>
            </div>
            {modelInfoOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
              : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            }
          </button>

          <AnimatePresence>
            {modelInfoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 pt-1 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1">
                      Version
                    </p>
                    <p className="font-mono text-text-primary text-xs">
                      {prediction.model_metadata.model_version}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1">
                      Fingerprint
                    </p>
                    <p className="font-mono text-text-primary text-xs">
                      {prediction.model_metadata.fingerprint_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1">
                      Radius
                    </p>
                    <p className="font-mono text-text-primary text-xs">
                      {prediction.model_metadata.fingerprint_radius}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-[10px] font-mono uppercase tracking-[0.12em] mb-1">
                      Size
                    </p>
                    <p className="font-mono text-text-primary text-xs">
                      {prediction.model_metadata.fingerprint_size}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
