import Papa from 'papaparse'
import type { PredictionResponse, BatchResultItem } from '../types/prediction'
import { THRESHOLD_META } from '../types/prediction'

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportSinglePredictionCSV(prediction: PredictionResponse): void {
  const rows = THRESHOLD_META.map(({ key, display, micromolar }) => {
    const result = prediction.predictions[key]
    return {
      Compound:           prediction.canonical_smiles,
      Formula:            prediction.molecular_formula,
      'MW (g/mol)':       prediction.molecular_weight,
      Threshold:          display,
      'IC50 Cutoff':      micromolar,
      Prediction:         result?.prediction ? 'TOXIC' : 'NON-TOXIC',
      'Probability':      result != null ? (result.probability * 100).toFixed(2) + '%' : '',
      'Risk Level':       result?.risk_level ?? '',
    }
  })

  rows.push({
    Compound:           prediction.canonical_smiles,
    Formula:            prediction.molecular_formula,
    'MW (g/mol)':       prediction.molecular_weight,
    Threshold:          'OVERALL',
    'IC50 Cutoff':      '',
    Prediction:         prediction.overall_risk_label,
    'Probability':      (prediction.overall_risk_score / 100).toFixed(4),
    'Risk Level':       prediction.overall_risk_label,
  } as typeof rows[0])

  const csv = Papa.unparse(rows)
  const slug = prediction.canonical_smiles.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')
  downloadCsv(csv, `herg_prediction_${slug}_${Date.now()}.csv`)
}

export function exportBatchCSV(results: BatchResultItem[]): void {
  const rows = results.flatMap((item) => {
    if (!item.success) {
      return [{
        ID: item.compound_id, SMILES: item.input_smiles,
        Error: item.error_code ?? 'UNKNOWN', Message: item.message ?? '',
        Threshold: '', 'IC50 Cutoff': '',
        Prediction: '', 'Probability': '',
        'Risk Level': '',
        'Overall Risk': '', 'Overall Score': '',
      }]
    }

    return THRESHOLD_META.map(({ key, display, micromolar }) => {
      const result = item.predictions[key]
      return {
        ID:              item.compound_id,
        SMILES:          item.canonical_smiles,
        Error: '', Message: '',
        Threshold:       display,
        'IC50 Cutoff':   micromolar,
        Prediction:      result?.prediction ? 'TOXIC' : 'NON-TOXIC',
        'Probability':   result != null ? (result.probability * 100).toFixed(2) + '%' : '',
        'Risk Level':    result?.risk_level ?? '',
        'Overall Risk':  item.overall_risk_label,
        'Overall Score': `${item.overall_risk_score.toFixed(2)} / 100`,
      }
    })
  })

  downloadCsv(Papa.unparse(rows), `herg_batch_prediction_${Date.now()}.csv`)
}
