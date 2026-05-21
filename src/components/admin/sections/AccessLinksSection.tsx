import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Settings, Trash2, Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { getAccessLinks, revokeAccessLink } from '../../../api/adminClient'
import { CreateLinkModal } from '../modals/CreateLinkModal'
import { EditLinkModal } from '../modals/EditLinkModal'
import type { AccessLink } from '../../../types/access'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function getLinkStatus(link: AccessLink): { label: string; className: string } {
  if (!link.is_active) {
    return { label: 'Revoked', className: 'text-red-300 border-red-700/50 bg-red-950/40' }
  }
  if (link.is_expired) {
    return { label: 'Expired', className: 'text-amber-300 border-amber-700/50 bg-amber-950/40' }
  }
  return { label: 'Active', className: 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40' }
}

export function AccessLinksSection() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate]   = useState(false)
  const [editTarget, setEditTarget]   = useState<AccessLink | null>(null)
  const [copied,     setCopied]       = useState<string | null>(null)

  const { data: links, isLoading, isError } = useQuery({
    queryKey: ['admin-links'],
    queryFn:  () => getAccessLinks(false),
  })

  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeAccessLink(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-links'] }),
  })

  const copyLink = (link: AccessLink) => {
    navigator.clipboard.writeText(link.access_url)
    setCopied(link.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary font-semibold text-base">Access Links</h2>
          <p className="text-text-muted text-xs font-mono mt-0.5">Manage access tokens for platform users</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-bg-primary
            font-mono font-semibold text-sm hover:bg-cyan-400 transition-all shadow-glow-cyan-sm"
        >
          <Plus className="w-4 h-4" />
          New Link
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-400 font-mono text-sm">Failed to load links.</div>
        ) : !links?.length ? (
          <div className="py-12 text-center text-text-muted font-mono text-sm">No access links yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 700 }} role="table">
              <thead>
                <tr className="border-b border-border bg-bg-elevated">
                  {['Label', 'Token', 'Created', 'Expires', 'Uses', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-text-muted font-mono text-[10px] tracking-[0.12em] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map((link) => {
                  const status = getLinkStatus(link)
                  return (
                    <tr
                      key={link.id}
                      className="border-b border-border/40 last:border-0 hover:bg-bg-elevated/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-text-primary font-mono text-xs max-w-[160px] truncate"
                        title={link.label ?? undefined}>
                        {link.label ?? <span className="text-text-muted italic">Unlabelled</span>}
                      </td>
                      <td className="px-4 py-3 text-accent-cyan font-mono text-xs">
                        {link.token.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs whitespace-nowrap">
                        {formatDate(link.created_at)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs whitespace-nowrap">
                        {link.expires_at
                          ? <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              {formatDate(link.expires_at)}
                            </span>
                          : <span className="text-text-muted">Never</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                        {link.uses_count}
                        {link.max_uses != null && (
                          <span className="text-text-muted"> / {link.max_uses}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono border ${status.className}`}>
                          {status.label === 'Active'
                            ? <CheckCircle2 className="w-2.5 h-2.5" />
                            : status.label === 'Revoked'
                            ? <XCircle className="w-2.5 h-2.5" />
                            : <Clock className="w-2.5 h-2.5" />
                          }
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyLink(link)}
                            title="Copy access URL"
                            className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-accent-cyan transition-colors"
                          >
                            {copied === link.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              : <Copy className="w-3.5 h-3.5" />
                            }
                          </button>
                          {link.is_active && (
                            <>
                              <button
                                onClick={() => setEditTarget(link)}
                                title="Edit link"
                                className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-amber-400 transition-colors"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => revokeMut.mutate(link.id)}
                                disabled={revokeMut.isPending && revokeMut.variables === link.id}
                                title="Revoke link"
                                className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-red-400
                                  transition-colors disabled:opacity-40"
                              >
                                {revokeMut.isPending && revokeMut.variables === link.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />
                                }
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refresh */}
      <button
        onClick={() => qc.invalidateQueries({ queryKey: ['admin-links'] })}
        className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary font-mono text-xs transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Refresh
      </button>

      {/* Modals */}
      <AnimatePresence>
        {showCreate  && <CreateLinkModal onClose={() => setShowCreate(false)} />}
        {editTarget  && <EditLinkModal link={editTarget} onClose={() => setEditTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}
