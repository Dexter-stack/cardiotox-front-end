import axios from 'axios'
import type {
  AdminInfo,
  AdminLoginResponse,
  AccessLink,
  CreateLinkPayload,
  EditLinkPayload,
  CreateAdminPayload,
} from '../types/access'
import type {
  PredictionsResponse,
  PredictionsFilter,
  PredictionRecord,
  PredictionFeedback,
  PredictionFeedbackPayload,
  RetrainResult,
} from '../types/adminTypes'

export const ADMIN_TOKEN_KEY = 'adminToken'
const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const adminApi = axios.create({
  baseURL: BASE,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      window.location.href = '/admin/login'
      return Promise.reject({ error_code: 'UNAUTHORIZED', message: 'Session expired.' })
    }
    const detail = err.response?.data?.detail
    if (detail && typeof detail === 'object') {
      return Promise.reject({
        error_code: detail.error_code ?? 'UNKNOWN_ERROR',
        message: detail.message ?? 'An unexpected error occurred.',
        status: err.response?.status,
      })
    }
    // flat error body (e.g. { "success": false, "error_code": "...", "message": "..." })
    const body = err.response?.data
    if (body?.error_code) {
      return Promise.reject({
        error_code: body.error_code,
        message: body.message ?? 'An unexpected error occurred.',
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

export interface AdminApiError {
  error_code: string
  message: string
  status?: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const { data } = await adminApi.post<AdminLoginResponse>('/admin/auth/login', { username, password })
  return data
}

export async function getAdminMe(): Promise<AdminInfo> {
  const { data } = await adminApi.get<AdminInfo>('/admin/auth/me')
  return data
}

// ─── Prediction history ───────────────────────────────────────────────────────

export async function getPredictions(filters: PredictionsFilter): Promise<PredictionsResponse> {
  const params: Record<string, string | number> = {
    limit: filters.limit,
    offset: filters.offset,
  }
  if (filters.source)     params.source     = filters.source
  if (filters.risk_label) params.risk_label = filters.risk_label
  if (filters.drug_name)  params.drug_name  = filters.drug_name
  const { data } = await adminApi.get<PredictionsResponse>('/predictions', { params })
  return data
}

export async function getPredictionById(id: string): Promise<PredictionRecord> {
  const { data } = await adminApi.get<PredictionRecord>(`/predictions/${id}`)
  return data
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(
  predictionId: string,
  payload: PredictionFeedbackPayload
): Promise<PredictionFeedback> {
  const { data } = await adminApi.post<PredictionFeedback>(
    `/admin/predictions/${predictionId}/feedback`,
    payload
  )
  return data
}

export async function getFeedback(predictionId: string): Promise<PredictionFeedback> {
  const { data } = await adminApi.get<PredictionFeedback>(
    `/admin/predictions/${predictionId}/feedback`
  )
  return data
}

// ─── Model retraining ─────────────────────────────────────────────────────────

export async function retrainModel(): Promise<RetrainResult> {
  const { data } = await adminApi.post<RetrainResult>('/admin/retrain')
  return data
}

// ─── Access links ─────────────────────────────────────────────────────────────

export async function getAccessLinks(activeOnly = false): Promise<AccessLink[]> {
  const { data } = await adminApi.get<AccessLink[]>('/admin/links', {
    params: { active_only: activeOnly },
  })
  return data
}

export async function createAccessLink(payload: CreateLinkPayload): Promise<AccessLink> {
  const { data } = await adminApi.post<AccessLink>('/admin/links', payload)
  return data
}

export async function editAccessLink(id: string, payload: EditLinkPayload): Promise<AccessLink> {
  const { data } = await adminApi.patch<AccessLink>(`/admin/links/${id}`, payload)
  return data
}

export async function revokeAccessLink(id: string): Promise<AccessLink> {
  const { data } = await adminApi.delete<AccessLink>(`/admin/links/${id}`)
  return data
}

// ─── Admin management ─────────────────────────────────────────────────────────

export async function getAdmins(): Promise<AdminInfo[]> {
  const { data } = await adminApi.get<AdminInfo[]>('/admin/admins')
  return data
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminInfo> {
  const { data } = await adminApi.post<AdminInfo>('/admin/admins', payload)
  return data
}

export async function deactivateAdmin(id: string): Promise<AdminInfo> {
  const { data } = await adminApi.delete<AdminInfo>(`/admin/admins/${id}`)
  return data
}

export default adminApi
