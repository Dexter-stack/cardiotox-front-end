import { create } from 'zustand'
import type { PredictionResponse, ExplainResponse } from '../types/prediction'

export type ActiveTab = 'smiles' | 'name' | 'batch'

interface PredictionState {
  currentPrediction: PredictionResponse | null
  currentExplanation: ExplainResponse | null
  isLoading: boolean
  isExplaining: boolean
  error: string | null
  activeTab: ActiveTab
  // Actions
  setPrediction: (prediction: PredictionResponse | null) => void
  setExplanation: (explanation: ExplainResponse | null) => void
  setLoading: (loading: boolean) => void
  setExplaining: (explaining: boolean) => void
  setError: (error: string | null) => void
  setActiveTab: (tab: ActiveTab) => void
  clearAll: () => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  currentPrediction: null,
  currentExplanation: null,
  isLoading: false,
  isExplaining: false,
  error: null,
  activeTab: 'smiles',

  setPrediction: (prediction) =>
    set({ currentPrediction: prediction, error: null, currentExplanation: null }),

  setExplanation: (explanation) => set({ currentExplanation: explanation }),

  setLoading: (loading) => set({ isLoading: loading }),

  setExplaining: (explaining) => set({ isExplaining: explaining }),

  setError: (error) => set({ error }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  clearAll: () =>
    set({
      currentPrediction: null,
      currentExplanation: null,
      isLoading: false,
      isExplaining: false,
      error: null,
    }),
}))
