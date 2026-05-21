import axios from 'axios'
import type {
  PredictionResponse,
  BatchItem,
  BatchResponse,
  ExplainResponse,
  PubChemResult,
  HealthResponse,
} from '../types/prediction'
import type { AccessValidationResponse } from '../types/access'

// Axios instance — baseURL from env with localhost fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

// Normalise error shape: FastAPI wraps errors in { detail: { ... } }
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail
    if (detail && typeof detail === 'object') {
      return Promise.reject({
        error_code: detail.error_code ?? 'UNKNOWN_ERROR',
        message: detail.message ?? 'An unexpected error occurred.',
        status: err.response?.status,
      })
    }
    return Promise.reject({
      error_code: 'NETWORK_ERROR',
      message: err.message ?? 'Network error.',
      status: err.response?.status,
    })
  }
)

export interface ApiError {
  error_code: string
  message: string
  status?: number
}

export async function predictBySmiles(smiles: string): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>('/predict/smiles', { smiles })
  return data
}

export async function predictByName(drugName: string): Promise<PredictionResponse> {
  const { data } = await api.post<PredictionResponse>('/predict/name', { drug_name: drugName })
  return data
}

export async function predictBatch(compounds: BatchItem[]): Promise<BatchResponse> {
  const { data } = await api.post<BatchResponse>('/predict/batch', { compounds })
  return data
}

export async function explainPrediction(smiles: string): Promise<ExplainResponse> {
  const { data } = await api.post<ExplainResponse>('/predict/smiles/explain', { smiles })
  return data
}

export async function searchPubChem(name: string): Promise<PubChemResult> {
  const { data } = await api.get<PubChemResult>('/pubchem/search', { params: { name } })
  return data
}

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}

export async function validateToken(token: string): Promise<AccessValidationResponse> {
  const { data } = await api.get<AccessValidationResponse>(`/access/${token}`)
  return data
}

export default api
