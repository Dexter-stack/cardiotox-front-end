// ─── Access-gate types ───────────────────────────────────────────────────────

export interface AccessValidationResponse {
  valid: boolean
  token: string
  description?: string
  expires_at?: string | null
}

// ─── Admin auth ───────────────────────────────────────────────────────────────

export interface AdminInfo {
  id: number
  username: string
  email: string
  is_superadmin: boolean
  is_active: boolean
}

export interface AdminLoginResponse {
  access_token: string
  token_type: string
  admin: AdminInfo
}

// ─── Access links ─────────────────────────────────────────────────────────────

export interface AccessLink {
  id: number
  token: string
  description: string
  access_url: string
  created_at: string
  expires_at: string | null
  is_active: boolean
  usage_count: number
}

export interface CreateLinkPayload {
  description: string
  expires_in_hours?: number | null
}

export interface ExtendLinkPayload {
  expires_in_hours: number
}

// ─── Admin management ─────────────────────────────────────────────────────────

export interface Admin {
  id: number
  username: string
  email: string
  is_superadmin: boolean
  is_active: boolean
}

export interface CreateAdminPayload {
  username: string
  email: string
  password: string
  is_superadmin?: boolean
}
