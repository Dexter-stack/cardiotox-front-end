// ─── Core types — aligned to the current CardioToxAI API response schema ───

export type RiskLevel          = 'Minimal' | 'Low' | 'Moderate' | 'High' | 'Very High'
export type CalibrationMethod  = 'none' | 'isotonic_regression' | 'isotonic_sorted'
export type Confidence    = 'High' | 'Medium' | 'Low'
export type ThresholdLabel = 'tox_1' | 'tox_5' | 'tox_10' | 'tox_30'
export type ResolvedFrom  = 'smiles_input' | 'drug_name' | 'batch'

/** Score-based overall-risk tier derived from overall_risk_score (0–100) */
export type OverallRiskLabel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk'

export interface ModelMetadata {
  model_version: string
  fingerprint_type: string
  fingerprint_radius: number
  fingerprint_size: number
}

// ─── Per-threshold prediction result ────────────────────────────────────────
export interface PredictionResult {
  /** True = compound predicted to block hERG at this threshold */
  prediction: boolean
  /** Raw XGBoost model output before monotonicity adjustment */
  raw_probability: number
  /** Probability after adjustment to ensure P increases with IC50 cutoff */
  adjusted_probability: number
  risk_level: RiskLevel
  confidence: Confidence
  /** Human-readable interpretation for this threshold */
  interpretation?: string
}

// ─── Full prediction response ────────────────────────────────────────────────
export interface PredictionResponse {
  success: boolean
  input_smiles: string
  resolved_from: ResolvedFrom
  molecular_weight: number
  molecular_formula: string
  canonical_smiles: string
  predictions: Record<string, PredictionResult>
  /** Overall risk tier label (e.g. "Low Risk", "High Risk") */
  overall_risk_label: string
  /** Overall risk score as a PERCENTAGE (0–100), e.g. 6.09 means 6.09 % */
  overall_risk_score: number
  /** True when the backend had to adjust probabilities for monotonicity */
  monotonicity_enforced?: boolean
  /** Calibration method applied to raw probabilities */
  calibration_method: CalibrationMethod
  /** Magnitude of probability shift introduced by calibration (0 = none) */
  calibration_distortion: number
  /** Model fingerprint / version metadata — null if not returned by API */
  model_metadata: ModelMetadata | null
  processing_time_ms: number
  // Drug-name resolution extras
  resolved_smiles?: string
  pubchem_cid?: number
  // Batch extras
  compound_id?: string
}

// ─── Batch ───────────────────────────────────────────────────────────────────
export interface BatchItem {
  id: string
  smiles: string
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
  shap_explanations: Record<ThresholdLabel, ShapValue[]> | null
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
  /** Key matching the API response predictions object */
  key: string
  label: ThresholdLabel
  display: string
  micromolar: string
  /** Abbreviated label for compact displays */
  short: string
}

export const THRESHOLD_META: ThresholdMeta[] = [
  { key: 'Strong blocker (≤1 µM)',     label: 'tox_1',  display: 'Strong Blocker',    micromolar: '≤1 µM',  short: '1 µM'  },
  { key: 'Moderate blocker (≤5 µM)',   label: 'tox_5',  display: 'Moderate Blocker',  micromolar: '≤5 µM',  short: '5 µM'  },
  { key: 'Weak blocker (≤10 µM)',      label: 'tox_10', display: 'Weak Blocker',      micromolar: '≤10 µM', short: '10 µM' },
  { key: 'Very weak blocker (≤30 µM)', label: 'tox_30', display: 'Very Weak Blocker', micromolar: '≤30 µM', short: '30 µM' },
]
