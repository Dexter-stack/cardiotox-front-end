/**
 * AdminDashboard — protected admin panel page.
 * Validates JWT from localStorage on mount; redirects to /admin if absent/invalid.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ADMIN_JWT_KEY } from '../../api/adminClient'
import { AdminSidebar } from './AdminSidebar'
import { AccessLinksSection } from './sections/AccessLinksSection'
import { AdminsSection } from './sections/AdminsSection'
import type { AdminInfo } from '../../types/access'

type Section = 'links' | 'admins'

function decodeAdmin(token: string): AdminInfo | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return {
      id: payload.id ?? 0,
      username: payload.username ?? payload.sub ?? '',
      email: payload.email ?? '',
      is_superadmin: payload.is_superadmin ?? false,
      is_active: payload.is_active ?? true,
    }
  } catch {
    return null
  }
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [section, setSection] = useState<Section>('links')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_JWT_KEY)
    if (!token) {
      navigate('/admin', { replace: true })
      return
    }
    const decoded = decodeAdmin(token)
    if (!decoded) {
      localStorage.removeItem(ADMIN_JWT_KEY)
      navigate('/admin', { replace: true })
      return
    }
    setAdmin(decoded)
    setChecking(false)
  }, [navigate])

  if (checking) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    )
  }

  if (!admin) return null

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <AdminSidebar
        active={section}
        onSelect={setSection}
        admin={admin}
        onLogout={() => navigate('/admin', { replace: true })}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {section === 'links' && <AccessLinksSection />}
        {section === 'admins' && admin.is_superadmin && <AdminsSection />}
        {section === 'admins' && !admin.is_superadmin && (
          <p className="text-text-muted font-mono text-sm">Access restricted to superadmins.</p>
        )}
      </main>
    </div>
  )
}
