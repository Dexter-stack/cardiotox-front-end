import type { RiskLevel, OverallRiskLabel, Confidence } from '../types/prediction'

// ─── Per-threshold risk level colours ────────────────────────────────────────
// Minimal → Green  |  Moderate → Yellow  |  High → Orange  |  Very High → Red

export const RISK_COLORS: Record<RiskLevel, string> = {
  'Minimal':   '#10b981',
  'Low':       '#4ade80',
  'Moderate':  '#eab308',
  'High':      '#f97316',
  'Very High': '#dc2626',
}

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  'Minimal':   'text-emerald-400',
  'Low':       'text-green-400',
  'Moderate':  'text-yellow-400',
  'High':      'text-orange-400',
  'Very High': 'text-red-500',
}

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  'Minimal':   'bg-emerald-950/60 text-emerald-300 border-emerald-700/70',
  'Low':       'bg-green-950/60  text-green-300   border-green-700/70',
  'Moderate':  'bg-yellow-950/60 text-yellow-300  border-yellow-700/70',
  'High':      'bg-orange-950/60 text-orange-300  border-orange-700/70',
  'Very High': 'bg-red-950/60    text-red-300     border-red-700/70',
}

// Subtle left-edge accent for table rows
export const RISK_ROW_ACCENT: Record<RiskLevel, string> = {
  'Minimal':   'border-l-emerald-500/40',
  'Low':       'border-l-green-500/40',
  'Moderate':  'border-l-yellow-500/40',
  'High':      'border-l-orange-500/50',
  'Very High': 'border-l-red-500/60',
}

// ─── Overall-risk score-based labels (score is 0–100) ────────────────────────

export const OVERALL_RISK_COLORS: Record<OverallRiskLabel, string> = {
  'Low Risk':      '#10b981',
  'Moderate Risk': '#eab308',
  'High Risk':     '#f97316',
  'Critical Risk': '#dc2626',
}

export const OVERALL_RISK_TEXT_CLASSES: Record<OverallRiskLabel, string> = {
  'Low Risk':      'text-emerald-400',
  'Moderate Risk': 'text-yellow-400',
  'High Risk':     'text-orange-400',
  'Critical Risk': 'text-red-400',
}

/**
 * Maps overall_risk_score (0–100 percentage) → four-tier OverallRiskLabel.
 * Falls back gracefully if the API ever returns the label directly.
 */
export function scoreToOverallLabel(score: number): OverallRiskLabel {
  if (score < 25) return 'Low Risk'
  if (score < 50) return 'Moderate Risk'
  if (score < 75) return 'High Risk'
  return 'Critical Risk'
}

/**
 * Maps the API's string overall_risk_label to the nearest RiskLevel so
 * components like RiskBadge (which expect a RiskLevel) can still be used.
 */
export function overallLabelToRiskLevel(label: string): RiskLevel {
  switch (label) {
    case 'Low Risk':      return 'Low'
    case 'Moderate Risk': return 'Moderate'
    case 'High Risk':     return 'High'
    case 'Critical Risk': return 'Very High'
    default:              return 'Minimal'
  }
}

/** Scientific interpretation keyed to overall risk tier */
export const OVERALL_INTERPRETATIONS: Record<OverallRiskLabel, string> = {
  'Low Risk':
    'Compound demonstrates low hERG channel binding affinity. Cardiac liability is unlikely at therapeutic concentrations. Standard pharmacovigilance applies.',
  'Moderate Risk':
    'Compound shows measurable hERG interaction potential. Preclinical cardiac safety studies (e.g., patch-clamp, APD assay) are recommended before advancing.',
  'High Risk':
    'Compound exhibits significant hERG channel inhibition. Detailed in vitro and in vivo cardiac safety profiling is strongly advised prior to clinical progression.',
  'Critical Risk':
    'Compound shows critical hERG blocking potential across multiple IC50 thresholds. Substantial cardiac liability — structural optimisation or de-risking strategy required.',
}

// ─── Confidence colours ───────────────────────────────────────────────────────

export const CONFIDENCE_TEXT_CLASSES: Record<Confidence, string> = {
  High:   'text-emerald-400',
  Medium: 'text-yellow-400',
  Low:    'text-red-400',
}

export const CONFIDENCE_DOT_CLASSES: Record<Confidence, string> = {
  High:   'bg-emerald-400',
  Medium: 'bg-yellow-400',
  Low:    'bg-red-400',
}

// ─── Recharts / SVG colour helpers ───────────────────────────────────────────

/** Hex colour for Recharts bars, interpolated by probability 0–1 */
export function probabilityToColor(probability: number): string {
  if (probability < 0.20) return '#10b981'
  if (probability < 0.35) return '#4ade80'
  if (probability < 0.50) return '#eab308'
  if (probability < 0.65) return '#f97316'
  if (probability < 0.80) return '#ef4444'
  return '#dc2626'
}

/** Hex colour for the risk gauge arc — score is 0–100 */
export function riskScoreToGaugeColor(score: number): string {
  if (score < 25) return '#10b981'
  if (score < 50) return '#eab308'
  if (score < 75) return '#f97316'
  return '#dc2626'
}

