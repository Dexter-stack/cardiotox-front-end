/**
 * MainApp — the protected main application page.
 * Checks localStorage for a valid access token; shows AccessGate if absent or invalid.
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, Atom, Loader2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SmileInput } from '../components/input/SmileInput'
import { DrugNameInput } from '../components/input/DrugNameInput'
import { BatchUpload } from '../components/input/BatchUpload'
import { PredictionCard } from '../components/results/PredictionCard'
import { ToxicityBarChart } from '../components/visualization/ToxicityBarChart'
import { RadarChartPanel } from '../components/visualization/RadarChart'
import { RiskGauge } from '../components/visualization/RiskGauge'
import { ShapPanel } from '../components/explainability/ShapPanel'
import { HistoryPanel } from '../components/history/HistoryPanel'
import { ExportButtons } from '../components/export/ExportButtons'
import { AccessGate, ACCESS_TOKEN_KEY } from '../components/access/AccessGate'
import { usePredictionStore } from '../store/predictionStore'
import { useHistory } from '../hooks/useHistory'
import { validateToken } from '../api/client'
import type { HistoryEntry } from '../types/prediction'

type Tab = 'smiles' | 'name' | 'batch'
type AuthState = 'checking' | 'granted' | 'denied'

const TABS: { id: Tab; label: string }[] = [
  { id: 'smiles', label: 'SMILES' },
  { id: 'name', label: 'Drug Name' },
  { id: 'batch', label: 'Batch' },
]

function MoleculeArt() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" className="opacity-20" aria-hidden="true">
      <polygon points="100,20 132,38 132,74 100,92 68,74 68,38" fill="none" stroke="#00d4ff" strokeWidth="1.5" />
      <polygon points="100,32 122,44 122,68 100,80 78,68 78,44" fill="none" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="4 3" />
      <line x1="100" y1="20" x2="100" y2="4" stroke="#00d4ff" strokeWidth="1.5" />
      <line x1="132" y1="38" x2="146" y2="30" stroke="#00d4ff" strokeWidth="1.5" />
      <line x1="132" y1="74" x2="148" y2="82" stroke="#00d4ff" strokeWidth="1.5" />
      <line x1="100" y1="92" x2="100" y2="108" stroke="#00d4ff" strokeWidth="1.5" />
      <polygon points="100,108 132,126 132,144 100,144 68,144 68,126" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.6" />
      {[
        [100, 4], [146, 30], [148, 82], [100, 108],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#00d4ff" />
      ))}
      <text x="96" y="2" fill="#00d4ff" fontSize="7" fontFamily="JetBrains Mono">OH</text>
      <text x="148" y="28" fill="#00d4ff" fontSize="7" fontFamily="JetBrains Mono">NH₂</text>
      <text x="150" y="85" fill="#00d4ff" fontSize="7" fontFamily="JetBrains Mono">Cl</text>
    </svg>
  )
}

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('smiles')
  const [authState, setAuthState] = useState<AuthState>('checking')
  const { currentPrediction } = usePredictionStore()
  const { history, addEntry, clearHistory, removeEntry } = useHistory()

  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!stored) {
      setAuthState('denied')
      return
    }
    validateToken(stored)
      .then((res) => setAuthState(res.valid ? 'granted' : 'denied'))
      .catch(() => setAuthState('denied'))
  }, [])

  const handleHistorySelect = (entry: HistoryEntry) => {
    usePredictionStore.getState().setPrediction(entry.response)
  }

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    )
  }

  if (authState === 'denied') {
    return <AccessGate onSuccess={() => setAuthState('granted')} />
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
      <Header />

      <div className="pt-16 flex flex-col md:flex-row min-h-screen">
        {/* ── Left column: Input + History ─────────────────────────── */}
        <aside className="w-full md:w-[420px] md:min-w-[420px] border-b md:border-b-0 md:border-r border-border
          bg-bg-secondary flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Input panel card */}
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-xs font-mono font-medium tracking-widest uppercase transition-all
                      ${activeTab === tab.id
                        ? 'text-accent-cyan border-b-2 border-accent-cyan bg-accent-cyan-glow'
                        : 'text-text-muted hover:text-text-secondary'
                      }`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                    aria-controls={`panel-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    id={`panel-${activeTab}`}
                    role="tabpanel"
                  >
                    {activeTab === 'smiles' && <SmileInput addHistory={addEntry} />}
                    {activeTab === 'name' && <DrugNameInput addHistory={addEntry} />}
                    {activeTab === 'batch' && <BatchUpload />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* History panel */}
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onRemove={removeEntry}
              onClear={clearHistory}
            />
          </div>
        </aside>

        {/* ── Right column: Results + Visualizations ─────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {currentPrediction ? (
              <motion.div
                key={currentPrediction.canonical_smiles}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <PredictionCard prediction={currentPrediction} />

                {/* Visualizations row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="w-4 h-4 text-accent-cyan" />
                      <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
                        Probability Analysis
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <ToxicityBarChart prediction={currentPrediction} />
                      <div className="border-t border-border pt-4">
                        <RadarChartPanel prediction={currentPrediction} />
                      </div>
                    </div>
                  </div>

                  {/* Gauge + processing info */}
                  <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <Atom className="w-4 h-4 text-accent-cyan" />
                      <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
                        Risk Gauge
                      </span>
                    </div>
                    <RiskGauge prediction={currentPrediction} />

                    {/* Processing metadata */}
                    <div className="mt-auto pt-4 border-t border-border space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-muted">Processing time</span>
                        <span className="text-text-secondary">{currentPrediction.processing_time_ms.toFixed(1)} ms</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-muted">Model</span>
                        <span className="text-text-secondary">XGBoost multi-label</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-muted">Probabilities</span>
                        <span className="text-accent-cyan">Threshold-adjusted</span>
                      </div>
                    </div>
                  </div>
                </div>

                <ShapPanel />

                <div className="bg-bg-card border border-border rounded-xl p-4">
                  <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-3">
                    Export Results
                  </p>
                  <ExportButtons prediction={currentPrediction} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6"
              >
                <MoleculeArt />
                <div className="space-y-2">
                  <p className="text-text-secondary text-lg font-medium">Enter a compound to begin analysis</p>
                  <p className="text-text-muted text-sm font-mono max-w-sm">
                    Predict hERG potassium channel inhibition risk across 4 IC50 thresholds using a multi-label XGBoost model
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs font-mono text-text-muted">
                  {['≤1 µM', '≤5 µM', '≤10 µM', '≤30 µM'].map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full border border-border bg-bg-card">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
