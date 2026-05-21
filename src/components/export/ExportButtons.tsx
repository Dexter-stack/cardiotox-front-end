import { Download, FileText, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PredictionResponse } from '../../types/prediction'
import { exportSinglePredictionCSV } from '../../utils/exportCSV'
import { exportPredictionPDF } from '../../utils/exportPDF'

interface ExportButtonsProps {
  prediction: PredictionResponse
}

export function ExportButtons({ prediction }: ExportButtonsProps) {
  const handleCopySmiles = async () => {
    try {
      await navigator.clipboard.writeText(prediction.canonical_smiles)
      toast.success('SMILES copied to clipboard', {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45' },
      })
    } catch {
      toast.error('Clipboard access denied', {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #dc2626' },
      })
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => exportSinglePredictionCSV(prediction)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border
          text-text-secondary hover:text-emerald-400 hover:border-emerald-700 transition-all text-xs font-mono"
        aria-label="Export as CSV"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>

      <button
        onClick={() => exportPredictionPDF(prediction)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border
          text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all text-xs font-mono"
        aria-label="Export as PDF report"
      >
        <FileText className="w-3.5 h-3.5" />
        Export PDF
      </button>

      <button
        onClick={handleCopySmiles}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated border border-border
          text-text-secondary hover:text-text-primary hover:border-border-bright transition-all text-xs font-mono"
        aria-label="Copy canonical SMILES to clipboard"
      >
        <Copy className="w-3.5 h-3.5" />
        Copy SMILES
      </button>
    </div>
  )
}
