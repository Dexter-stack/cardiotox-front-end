import axios from 'axios'
import type {
  AdminLoginResponse,
  AccessLink,
  CreateLinkPayload,
  ExtendLinkPayload,
  Admin,
  CreateAdminPayload,
} from '../types/access'

const ADMIN_JWT_KEY = 'cardiotox_admin_jwt'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_JWT_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise errors; redirect to /admin on 401
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(ADMIN_JWT_KEY)
      window.location.href = '/admin'
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
    return Promise.reject({
      error_code: 'NETWORK_ERROR',
      message: err.message ?? 'Network error.',
      status: err.response?.status,
    })
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const { data } = await adminApi.post<AdminLoginResponse>('/admin/auth/login', { username, password })
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

export async function revokeAccessLink(id: number): Promise<void> {
  await adminApi.delete(`/admin/links/${id}`)
}

export async function extendAccessLink(id: number, payload: ExtendLinkPayload): Promise<AccessLink> {
  const { data } = await adminApi.patch<AccessLink>(`/admin/links/${id}`, payload)
  return data
}

// ─── Admins ───────────────────────────────────────────────────────────────────

export async function getAdmins(): Promise<Admin[]> {
  const { data } = await adminApi.get<Admin[]>('/admin/admins')
  return data
}

export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  const { data } = await adminApi.post<Admin>('/admin/admins', payload)
  return data
}

export async function deactivateAdmin(id: number): Promise<void> {
  await adminApi.delete(`/admin/admins/${id}`)
}

export { ADMIN_JWT_KEY }
export default adminApi
