/**
 * Display formatters for CardioToxAI prediction values.
 * These are the canonical formatting functions — use them everywhere,
 * never multiply/divide risk scores or probabilities ad-hoc.
 */

/** probability is 0.0–1.0; displays as e.g. "7.0%" */
export const formatProbability = (p: number): string =>
  `${(p * 100).toFixed(1)}%`

/** overall_risk_score is already 0–100; displays as e.g. "18.3 / 100" */
export const formatRiskScore = (s: number): string =>
  `${s.toFixed(1)} / 100`

/** Hex fill color keyed by risk_level string */
export const getRiskColor = (riskLevel: string): string =>
  ({
    Minimal:    '#10b981',
    Low:        '#84cc16',
    Moderate:   '#f59e0b',
    High:       '#f97316',
    'Very High':'#ef4444',
  } as Record<string, string>)[riskLevel] ?? '#94a3b8'

/** Tailwind bg+text classes keyed by overall_risk_label string */
export const getRiskBgClass = (label: string): string =>
  ({
    'Minimal Risk':   'bg-gray-700/60   text-gray-200   border-gray-600/50',
    'Low Risk':       'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    'Moderate Risk':  'bg-amber-900/60   text-amber-300   border-amber-700/50',
    'High Risk':      'bg-orange-900/60  text-orange-300  border-orange-700/50',
    'Very High Risk': 'bg-red-900/60     text-red-300     border-red-700/50',
    // legacy
    'Critical Risk':  'bg-red-900/60     text-red-300     border-red-700/50',
  } as Record<string, string>)[label] ?? 'bg-gray-700/60 text-gray-300 border-gray-600/50'

/** Human-readable label for a dominant_threshold key */
export const getDominantThresholdLabel = (t: string | null): string =>
  ({
    tox_1:  'Strong blocker (≤1 µM)',
    tox_5:  'Moderate blocker (≤5 µM)',
    tox_10: 'Weak blocker (≤10 µM)',
    tox_30: 'Very weak blocker (≤30 µM)',
  } as Record<string, string>)[t ?? ''] ?? ''

/** Probability → Tailwind text-color class */
export const probTextClass = (p: number): string => {
  if (p < 0.20) return 'text-emerald-400'
  if (p < 0.40) return 'text-yellow-400'
  if (p < 0.60) return 'text-orange-400'
  return 'text-red-400'
}
