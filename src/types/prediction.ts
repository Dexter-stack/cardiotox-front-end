// ─── Core types — aligned to the updated CardioToxAI API response schema ────

export type RiskLevel         = 'Minimal' | 'Low' | 'Moderate' | 'High' | 'Very High'
export type CalibrationMethod = 'none' | 'isotonic_regression' | 'isotonic_sorted'
export type ThresholdKey      = 'tox_1' | 'tox_5' | 'tox_10' | 'tox_30'
/** Alias for ThresholdKey — used by ShapPanel */
export type ThresholdLabel    = ThresholdKey
export type ResolvedFrom      = 'smiles_input' | 'drug_name' | 'batch'
export type OverallRiskLabel  = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk'
// Kept for backward compat with riskColors.ts
export type Confidence        = 'High' | 'Medium' | 'Low'

export interface ModelMetadata {
  model_version: string
  fingerprint_type: string
  fingerprint_radius: number
  fingerprint_size: number
}

// ─── Per-threshold prediction result (new schema) ────────────────────────────
export interface ThresholdPrediction {
  label: string
  probability: number       // 0.0–1.0; display as × 100 %
  prediction: boolean       // true = blocker at this threshold
  risk_level: RiskLevel
}

// ─── Full prediction response ────────────────────────────────────────────────
export interface PredictionResponse {
  success: boolean
  drug_name: string | null
  input_smiles: string
  canonical_smiles: string
  molecular_formula: string
  molecular_weight: number

  predictions: Record<ThresholdKey, ThresholdPrediction>

  /** 0–100 scale, already percentage — display as "18.3 / 100", NEVER × 100 */
  overall_risk_score: number
  /** 0.0–1.0 — use directly for gauge arc fill, no multiplication */
  overall_risk_score_normalized: number
  overall_risk_label: string
  dominant_threshold: ThresholdKey | null

  monotonicity_enforced: boolean
  calibration_method: string
  calibration_distortion: number
  low_confidence: boolean
  confidence_warning: string | null
  clinical_summary: string
  processing_time_ms: number

  // Legacy optional fields — old API responses stored in localStorage
  resolved_from?: ResolvedFrom
  model_metadata?: ModelMetadata | null
  pubchem_cid?: number
  resolved_smiles?: string
}

// ─── Batch ───────────────────────────────────────────────────────────────────
export interface BatchItem {
  id: string
  smiles?: string
  drug_name?: string
}

export interface BatchResultItem extends PredictionResponse {
  compound_id: string
  error_code?: string
  message?: string
}

export interface BatchResponse {
  results: BatchResultItem[]
}

// ─── SHAP explainability ─────────────────────────────────────────────────────
export interface ShapValue {
  bit_index: number
  shap_value: number
  direction: 'increases_risk' | 'decreases_risk'
}

export interface ExplainResponse {
  success: boolean
  input_smiles: string
  prediction: PredictionResponse
  shap_explanations: Record<ThresholdKey, ShapValue[]> | null
}

// ─── PubChem lookup ──────────────────────────────────────────────────────────
export interface PubChemResult {
  drug_name: string
  smiles: string
  cid: number
  iupac_name: string
  molecular_formula: string
}

// ─── Health ──────────────────────────────────────────────────────────────────
export interface HealthResponse {
  status: 'ok' | 'error'
  model_loaded: boolean
  version: string
}

// ─── LocalStorage history entry ──────────────────────────────────────────────
export interface HistoryEntry {
  id: string
  timestamp: number
  input: string
  inputType: 'smiles' | 'name'
  response: PredictionResponse
}

// ─── Static threshold display metadata ───────────────────────────────────────
export interface ThresholdMeta {
  /** API key — matches prediction.predictions object keys */
  key: ThresholdKey
  /** Alias for key, kept for backward compat */
  label: ThresholdKey
  display: string
  micromolar: string
  short: string
}

export const THRESHOLD_META: ThresholdMeta[] = [
  { key: 'tox_1',  label: 'tox_1',  display: 'Strong Blocker',   micromolar: '≤1 µM',  short: '1 µM'  },
  { key: 'tox_5',  label: 'tox_5',  display: 'Moderate Blocker', micromolar: '≤5 µM',  short: '5 µM'  },
  { key: 'tox_10', label: 'tox_10', display: 'Weak Blocker',      micromolar: '≤10 µM', short: '10 µM' },
  { key: 'tox_30', label: 'tox_30', display: 'Very Weak Blocker', micromolar: '≤30 µM', short: '30 µM' },
]
