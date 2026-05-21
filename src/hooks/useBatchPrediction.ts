import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { predictBatch } from '../api/client'
import type { BatchItem, BatchResponse } from '../types/prediction'
import type { ApiError } from '../api/client'

export function useBatchPrediction(onSuccess?: (data: BatchResponse) => void) {
  return useMutation({
    mutationFn: (compounds: BatchItem[]) => predictBatch(compounds),
    onSuccess: (data) => {
      const failed = data.results.filter((r) => !r.success).length
      const succeeded = data.results.length - failed

      if (failed > 0) {
        toast(`Batch complete: ${succeeded} succeeded, ${failed} failed`, {
          icon: '⚠️',
          style: { background: '#451a03', color: '#fde68a', border: '1px solid #78350f' },
        })
      } else {
        toast.success(`Batch complete: ${succeeded} compounds predicted`, {
          style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e2d45' },
        })
      }

      onSuccess?.(data)
    },
    onError: (err) => {
      const e = err as unknown as ApiError
      toast.error(e.message ?? 'Batch prediction failed', {
        style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #dc2626' },
      })
    },
  })
}
