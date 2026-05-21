// ─── Admin prediction history ────────────────────────────────────────────────

export interface PredictionThresholdResult {
  probability: number
  prediction: boolean
}

export interface PredictionRecord {
  id: string
  created_at: string
  source: 'smiles_input' | 'drug_name' | 'batch'
  drug_name: string | null
  input_smiles: string
  canonical_smiles: string
  molecular_formula: string
  molecular_weight: number
  raw_probabilities: {
    tox_1: number
    tox_5: number
    tox_10: number
    tox_30: number
  }
  tox_1:  PredictionThresholdResult
  tox_5:  PredictionThresholdResult
  tox_10: PredictionThresholdResult
  tox_30: PredictionThresholdResult
  overall_risk_label: string
  overall_risk_score: number
  monotonicity_enforced: boolean
  calibration_method: string
  calibration_distortion: number
  processing_time_ms: number
}

export interface PredictionsResponse {
  total: number
  count: number
  limit: number
  offset: number
  results: PredictionRecord[]
}

export interface PredictionsFilter {
  source?: string
  risk_label?: string
  drug_name?: string
  limit: number
  offset: number
}

// ─── Prediction feedback ─────────────────────────────────────────────────────

export interface PredictionFeedback {
  id: string
  prediction_id: string
  submitted_by_id: string
  verified_tox_1:  boolean | null
  verified_tox_5:  boolean | null
  verified_tox_10: boolean | null
  verified_tox_30: boolean | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface PredictionFeedbackPayload {
  verified_tox_1:  boolean | null
  verified_tox_5:  boolean | null
  verified_tox_10: boolean | null
  verified_tox_30: boolean | null
  notes?: string
}

// ─── Model retraining ─────────────────────────────────────────────────────────

export interface RetrainResult {
  success: boolean
  message: string
  samples_used: number
  labels_updated: Record<string, number>
  labels_skipped: string[]
  model_version: string | null
  retrained_at: string | null
}
