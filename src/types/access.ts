// ─── Access-gate ─────────────────────────────────────────────────────────────

export type AccessDeniedReason = 'expired' | 'revoked' | 'not_found' | 'limit_reached'

export interface AccessValidationResponse {
  valid: boolean
  label: string | null
  expires_at: string | null
  reason: AccessDeniedReason | null
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export interface AdminInfo {
  id: string
  username: string
  email: string
  is_superadmin: boolean
  is_active: boolean
  created_at: string
  created_by_id: string | null
}

export interface AdminLoginResponse {
  access_token: string
  token_type: string
  admin: AdminInfo
}

// ─── Access links ─────────────────────────────────────────────────────────────

export interface AccessLink {
  id: string
  token: string
  access_url: string
  label: string | null
  created_by_id: string
  expires_at: string | null
  max_uses: number | null
  uses_count: number
  is_active: boolean
  is_expired: boolean
  created_at: string
  last_accessed_at: string | null
}

export interface CreateLinkPayload {
  label?: string
  expires_in_hours?: number
  max_uses?: number
}

export interface EditLinkPayload {
  label?: string
  expires_in_hours?: number
  max_uses?: number
  is_active?: boolean
}

// ─── Admin management ─────────────────────────────────────────────────────────

export interface CreateAdminPayload {
  username: string
  email: string
  password: string
  is_superadmin?: boolean
}
