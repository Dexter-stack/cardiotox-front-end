import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { predictBySmiles, predictByName, explainPrediction } from '../api/client'
import { usePredictionStore } from '../store/predictionStore'
import type { ApiError } from '../api/client'

function formatApiError(err: unknown): string {
  const e = err as ApiError
  return e.message ?? 'An unexpected error occurred.'
}

export function useSmilesPredict() {
  const { setPrediction, setLoading, setError } = usePredictionStore()

  return useMutation({
    mutationFn: predictBySmiles,
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (data) => {
      setPrediction(data)
      setLoading(false)
      toast.success('Prediction complete', {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45' },
      })
    },
    onError: (err) => {
      const msg = formatApiError(err)
      setError(msg)
      setLoading(false)
      toast.error(msg, {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #dc2626' },
      })
    },
  })
}

export function useNamePredict() {
  const { setPrediction, setLoading, setError } = usePredictionStore()

  return useMutation({
    mutationFn: predictByName,
    onMutate: () => {
      setLoading(true)
      setError(null)
      toast('Resolving compound via PubChem…', {
        icon: '🔍',
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45' },
      })
    },
    onSuccess: (data) => {
      setPrediction(data)
      setLoading(false)
      toast.success('Prediction complete', {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45' },
      })
    },
    onError: (err) => {
      const msg = formatApiError(err)
      setError(msg)
      setLoading(false)
      toast.error(msg, {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #dc2626' },
      })
    },
  })
}

export function useExplainPrediction() {
  const { setExplanation, setExplaining } = usePredictionStore()

  return useMutation({
    mutationFn: explainPrediction,
    onMutate: () => {
      setExplaining(true)
    },
    onSuccess: (data) => {
      setExplanation(data)
      setExplaining(false)
    },
    onError: (err) => {
      setExplaining(false)
      const msg = formatApiError(err)
      toast.error(`SHAP explanation failed: ${msg}`, {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #dc2626' },
      })
    },
  })
}
