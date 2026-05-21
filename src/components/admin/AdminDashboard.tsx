/**
 * AdminDashboard — protected layout shell.
 * Validates adminToken via GET /admin/auth/me on mount.
 * Renders sidebar + <Outlet> for nested admin routes.
 */

import { useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getAdminMe, ADMIN_TOKEN_KEY } from '../../api/adminClient'
import { AdminSidebar } from './AdminSidebar'
import type { AdminInfo } from '../../types/access'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }
    getAdminMe()
      .then((info) => {
        setAdmin(info)
        setChecking(false)
      })
      .catch(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        navigate('/admin/login', { replace: true })
      })
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
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      <AdminSidebar
        admin={admin}
        onLogout={() => {
          localStorage.removeItem(ADMIN_TOKEN_KEY)
          navigate('/admin/login', { replace: true })
        }}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-h-0">
        <Outlet context={{ admin }} />
      </main>
    </div>
  )
}
