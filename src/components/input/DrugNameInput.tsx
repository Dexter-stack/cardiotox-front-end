import { useState, useEffect, useRef } from 'react'
import { Loader2, Search, ExternalLink } from 'lucide-react'
import { usePredictionStore } from '../../store/predictionStore'
import { useNamePredict } from '../../hooks/usePrediction'
import { useHistory } from '../../hooks/useHistory'

const EXAMPLE_DRUGS = ['Terfenadine', 'Verapamil', 'Aspirin', 'Caffeine']

interface DrugNameInputProps {
  addHistory: ReturnType<typeof useHistory>['addEntry']
}

export function DrugNameInput({ addHistory }: DrugNameInputProps) {
  const [drugName, setDrugName] = useState('')
  const [resolvedInfo, setResolvedInfo] = useState<{
    smiles: string
    cid: number
    formula: string
  } | null>(null)
  const { isLoading, currentPrediction } = usePredictionStore()
  const predict = useNamePredict()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When a prediction resolves from drug name, capture resolved info
  useEffect(() => {
    if (currentPrediction?.resolved_from === 'drug_name' && currentPrediction.pubchem_cid) {
      setResolvedInfo({
        smiles: currentPrediction.canonical_smiles,
        cid: currentPrediction.pubchem_cid,
        formula: currentPrediction.molecular_formula,
      })
    }
  }, [currentPrediction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = drugName.trim()
    if (!trimmed) return
    setResolvedInfo(null)
    predict.mutate(trimmed, {
      onSuccess: (data) => addHistory(trimmed, 'name', data),
    })
  }

  const handleChange = (val: string) => {
    setDrugName(val)
    setResolvedInfo(null)
    // Clear debounce timer on change — actual resolution happens on submit only
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-text-muted" />
          )}
        </div>
        <input
          type="text"
          value={drugName}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter drug name (e.g. verapamil)…"
          className="w-full bg-bg-elevated border border-border rounded-lg pl-10 pr-4 py-3
            font-sans text-sm text-text-primary placeholder-text-muted
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
            transition-colors"
          aria-label="Drug name input"
          autoComplete="off"
        />
      </div>

      {/* Example drug buttons */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_DRUGS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setDrugName(name.toLowerCase())}
            className="px-3 py-1.5 rounded-lg bg-bg-elevated border border-border
              text-text-secondary text-xs font-mono hover:border-accent-cyan/40 hover:text-accent-cyan transition-all"
            aria-label={`Search for ${name}`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Resolved compound info */}
      {resolvedInfo && (
        <div className="bg-bg-elevated border border-border/50 rounded-lg px-3 py-2.5 space-y-1">
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest">Resolved via PubChem</p>
          <p className="text-accent-cyan text-xs font-mono truncate" title={resolvedInfo.smiles}>
            {resolvedInfo.smiles}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-xs font-mono">
              CID: <span className="text-text-primary">{resolvedInfo.cid}</span>
            </span>
            <span className="text-text-secondary text-xs font-mono">
              Formula: <span className="text-text-primary">{resolvedInfo.formula}</span>
            </span>
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${resolvedInfo.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent-cyan text-xs hover:text-cyan-300 transition-colors"
              aria-label="View on PubChem"
            >
              <ExternalLink className="w-3 h-3" />
              PubChem
            </a>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !drugName.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
          bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
          hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
        aria-label="Resolve drug and predict toxicity"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Resolving via PubChem…
          </>
        ) : (
          'Resolve & Predict'
        )}
      </button>

      <p className="text-text-muted text-xs text-center font-mono">
        Drug names are resolved to SMILES via PubChem REST API
      </p>
    </form>
  )
}
