import { useState } from 'react'
import { Loader2, FlaskConical } from 'lucide-react'
import { usePredictionStore } from '../../store/predictionStore'
import { useSmilesPredict } from '../../hooks/usePrediction'
import { useHistory } from '../../hooks/useHistory'

const EXAMPLE_MOLECULES = [
  { label: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
  { label: 'Caffeine', smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C' },
  { label: 'Verapamil', smiles: 'COc1ccc(CCN(C)CCCC(C#N)(c2ccc(OC)c(OC)c2)C(C)C)cc1OC' },
]

interface SmileInputProps {
  addHistory: ReturnType<typeof useHistory>['addEntry']
}

export function SmileInput({ addHistory }: SmileInputProps) {
  const [smiles, setSmiles] = useState('')
  const { isLoading } = usePredictionStore()
  const predict = useSmilesPredict()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = smiles.trim()
    if (!trimmed) return
    predict.mutate(trimmed, {
      onSuccess: (data) => addHistory(trimmed, 'smiles', data),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* SMILES textarea */}
      <div>
        <textarea
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Enter SMILES string…"
          rows={4}
          className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3
            font-mono text-sm text-text-primary placeholder-text-muted
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
            resize-none transition-colors"
          aria-label="SMILES input"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="flex justify-between mt-1 px-1">
          <span className="text-text-muted text-xs font-mono">
            {smiles.length > 0 ? `${smiles.length} chars` : 'SMILES notation (e.g. CCO for ethanol)'}
          </span>
          {smiles.length > 0 && (
            <button
              type="button"
              onClick={() => setSmiles('')}
              className="text-text-muted hover:text-text-secondary text-xs font-mono transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Example buttons */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_MOLECULES.map(({ label, smiles: s }) => (
          <button
            key={label}
            type="button"
            onClick={() => setSmiles(s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border
              text-text-secondary text-xs font-mono hover:border-accent-cyan/40 hover:text-accent-cyan transition-all"
            aria-label={`Load ${label} SMILES`}
          >
            <FlaskConical className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !smiles.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
          bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
          hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
        aria-label="Run hERG cardio toxicity prediction"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Predicting…
          </>
        ) : (
          'Predict hERG Cardio Toxicity'
        )}
      </button>
    </form>
  )
}
