import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, Shield, User, RefreshCw } from 'lucide-react'
import { getAdmins, deactivateAdmin } from '../../../api/adminClient'
import { CreateAdminModal } from '../modals/CreateAdminModal'

export function AdminsSection() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: admins, isLoading, isError } = useQuery({
    queryKey: ['admin-admins'],
    queryFn: getAdmins,
  })

  const deactivateMut = useMutation({
    mutationFn: (id: number) => deactivateAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-admins'] }),
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary font-semibold text-base">Admins</h2>
          <p className="text-text-muted text-xs font-mono mt-0.5">Manage administrator accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-bg-primary
            font-mono font-semibold text-sm hover:bg-cyan-400 transition-all shadow-glow-cyan-sm"
        >
          <Plus className="w-4 h-4" />
          New Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-400 font-mono text-sm">Failed to load admins.</div>
        ) : !admins?.length ? (
          <div className="py-12 text-center text-text-muted font-mono text-sm">No admins found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg-elevated">
                  {['Username', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-text-muted font-mono text-[10px]
                      tracking-[0.12em] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border/40 last:border-0
                    hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-primary">
                      {admin.username}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      {admin.is_superadmin ? (
                        <span className="inline-flex items-center gap-1.5 text-violet-300 border border-violet-700/50
                          bg-violet-950/40 rounded px-2 py-0.5 text-[10px] font-mono">
                          <Shield className="w-2.5 h-2.5" />
                          Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-text-secondary border border-border
                          bg-bg-elevated rounded px-2 py-0.5 text-[10px] font-mono">
                          <User className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono border
                        ${admin.is_active
                          ? 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40'
                          : 'text-red-300 border-red-700/50 bg-red-950/40'
                        }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {admin.is_active && (
                        <button
                          onClick={() => deactivateMut.mutate(admin.id)}
                          disabled={deactivateMut.isPending}
                          title="Deactivate admin"
                          className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-red-400
                            transition-colors disabled:opacity-40"
                        >
                          {deactivateMut.isPending && deactivateMut.variables === admin.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={() => qc.invalidateQueries({ queryKey: ['admin-admins'] })}
        className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary
          font-mono text-xs transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Refresh
      </button>

      <AnimatePresence>
        {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}
