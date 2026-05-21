import { useState, useCallback } from 'react'
import type { HistoryEntry, PredictionResponse } from '../types/prediction'

const STORAGE_KEY = 'hergtox_history'
const MAX_ENTRIES = 20

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage quota exceeded — silently skip
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = useCallback(
    (input: string, inputType: 'smiles' | 'name', response: PredictionResponse) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        input,
        inputType,
        response,
      }
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES)
        saveHistory(next)
        return next
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveHistory(next)
      return next
    })
  }, [])

  return { history, addEntry, clearHistory, removeEntry }
}
