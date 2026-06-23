import { useState, useRef, useCallback } from 'react'
import { Upload, FileUp, Loader2, Download, X } from 'lucide-react'
import Papa from 'papaparse'
import { useBatchPrediction } from '../../hooks/useBatchPrediction'
import { exportBatchCSV } from '../../utils/exportCSV'
import type { BatchItem, BatchResponse, BatchResultItem } from '../../types/prediction'
import { RiskBadge } from '../results/RiskBadge'
import { overallLabelToRiskLevel } from '../../utils/riskColors'

type CsvMode = 'smiles' | 'name'

interface ParsedRow {
  id: string
  smiles?: string
  drug_name?: string
}

export function BatchUpload() {
  const [rows, setRows]           = useState<ParsedRow[]>([])
  const [mode, setMode]           = useState<CsvMode>('smiles')
  const [parseError, setParseError] = useState<string | null>(null)
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const batch = useBatchPrediction((data) => setBatchResult(data))

  const parseCSV = useCallback((file: File) => {
    setParseError(null)
    setBatchResult(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = (results.meta.fields ?? []).map((h) => h.trim().toLowerCase())

        const hasSmiles = headers.includes('smiles')
        const hasName   = headers.includes('name')

        if (!hasSmiles && !hasName) {
          setParseError('CSV must have a "smiles" column, or a "name" column for drug name lookup')
          return
        }

        if (hasName && !hasSmiles) {
          // Name-only format: use name as both id and drug_name
          const parsed = results.data
            .map((row) => {
              const name = String(row['name'] ?? row['Name'] ?? '').trim()
              const id   = String(row['id']   ?? row['ID']   ?? name).trim()
              return { id: id || name, drug_name: name }
            })
            .filter((r) => r.drug_name)
          if (parsed.length === 0) {
            setParseError('No valid rows found in the "name" column')
            return
          }
          setMode('name')
          setRows(parsed)
        } else {
          // SMILES format: require id + smiles
          if (!headers.includes('id')) {
            setParseError('CSV must contain "id" and "smiles" columns (or just a "name" column)')
            return
          }
          const parsed = results.data
            .map((row) => ({
              id:    String(row['id']    ?? '').trim(),
              smiles: String(row['smiles'] ?? '').trim(),
            }))
            .filter((r) => r.id && r.smiles)
          if (parsed.length === 0) {
            setParseError('No valid rows found — check that "id" and "smiles" columns are not empty')
            return
          }
          setMode('smiles')
          setRows(parsed)
        }
      },
      error: (err) => setParseError(err.message),
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseCSV(file)
  }, [parseCSV])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseCSV(file)
  }

  const handleRun = () => {
    const compounds: BatchItem[] = rows.map((r) =>
      r.drug_name
        ? { id: r.id, drug_name: r.drug_name }
        : { id: r.id, smiles: r.smiles }
    )
    batch.mutate(compounds)
  }

  const clearAll = () => {
    setRows([])
    setBatchResult(null)
    setParseError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-accent-cyan bg-accent-cyan-glow'
            : 'border-border hover:border-border-bright hover:bg-bg-elevated/50'
          }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-accent-cyan' : 'text-text-muted'}`} />
        <p className="text-text-secondary text-sm font-medium">
          Drop CSV here or <span className="text-accent-cyan">click to browse</span>
        </p>
        <div className="mt-2 space-y-0.5 text-[11px] font-mono text-text-muted">
          <p>
            Format A — SMILES: <span className="text-text-secondary">id</span>,{' '}
            <span className="text-text-secondary">smiles</span>
          </p>
          <p>
            Format B — Drug names: <span className="text-text-secondary">name</span>
            <span className="text-text-muted"> (id optional)</span>
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      {parseError && (
        <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-3 py-2 text-red-300 text-xs font-mono">
          {parseError}
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-xs font-mono">
              {rows.length} compound{rows.length !== 1 ? 's' : ''} loaded
              {' '}—{' '}
              <span className="text-accent-cyan">
                {mode === 'name' ? 'drug name lookup' : 'SMILES'}
              </span>
              {rows.length > 5 && ', showing first 5'}
            </span>
            <button onClick={clearAll} className="text-text-muted hover:text-red-400 transition-colors" aria-label="Clear CSV">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-bg-elevated border-b border-border">
                  <th className="text-left px-3 py-2 text-text-secondary">ID</th>
                  {mode === 'smiles'
                    ? <th className="text-left px-3 py-2 text-text-secondary">SMILES</th>
                    : <th className="text-left px-3 py-2 text-text-secondary">Drug Name</th>
                  }
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-bg-elevated/50">
                    <td className="px-3 py-2 text-text-primary">{row.id}</td>
                    {mode === 'smiles' ? (
                      <td className="px-3 py-2 text-accent-cyan truncate max-w-[180px]" title={row.smiles}>
                        {row.smiles}
                      </td>
                    ) : (
                      <td className="px-3 py-2 text-text-primary">{row.drug_name}</td>
                    )}
                  </tr>
                ))}
                {rows.length > 5 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-text-muted text-center">
                      …and {rows.length - 5} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Run button */}
      {rows.length > 0 && (
        <button
          onClick={handleRun}
          disabled={batch.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
            bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
            hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
          aria-label="Run batch prediction"
        >
          {batch.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing {rows.length} compounds…
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              Run Batch Prediction
            </>
          )}
        </button>
      )}

      {/* Batch results summary */}
      {batchResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-xs font-mono">
              {batchResult.results.filter((r) => r.success).length} / {batchResult.results.length} succeeded
            </p>
            <button
              onClick={() => exportBatchCSV(batchResult.results as BatchResultItem[])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border
                text-text-secondary hover:text-emerald-400 hover:border-emerald-700 transition-all text-xs font-mono"
              aria-label="Download batch results as CSV"
            >
              <Download className="w-3 h-3" />
              Download Batch CSV
            </button>
          </div>
          <div className="overflow-y-auto max-h-48 rounded-lg border border-border space-y-0.5 p-1.5">
            {batchResult.results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-elevated border border-border/50 text-xs font-mono"
              >
                <span className="text-text-secondary truncate max-w-[100px]" title={r.compound_id}>
                  {r.compound_id}
                </span>
                {r.success ? (
                  <RiskBadge risk={overallLabelToRiskLevel(r.overall_risk_label)} size="sm" />
                ) : (
                  <span className="text-red-400">{r.error_code ?? 'ERROR'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
