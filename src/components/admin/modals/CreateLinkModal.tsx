import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Copy, CheckCircle2, Link } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAccessLink } from '../../../api/adminClient'
import type { AccessLink } from '../../../types/access'

interface CreateLinkModalProps {
  onClose: () => void
}

export function CreateLinkModal({ onClose }: CreateLinkModalProps) {
  const qc = useQueryClient()
  const [label, setLabel] = useState('')
  const [expiresHours, setExpiresHours] = useState('72')
  const [maxUses, setMaxUses] = useState('')
  const [created, setCreated] = useState<AccessLink | null>(null)
  const [copied, setCopied] = useState(false)

  const mut = useMutation({
    mutationFn: () =>
      createAccessLink({
        label: label.trim() || undefined,
        expires_in_hours: expiresHours ? Number(expiresHours) : undefined,
        max_uses: maxUses ? Number(maxUses) : undefined,
      }),
    onSuccess: (link) => {
      setCreated(link)
      qc.invalidateQueries({ queryKey: ['admin-links'] })
    },
  })

  const copyUrl = () => {
    if (!created) return
    navigator.clipboard.writeText(created.access_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-bg-card border border-border rounded-2xl shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-accent-cyan" />
            <span className="text-text-primary font-semibold text-sm">Generate New Link</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {created ? (
              <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-mono text-sm font-medium">Link generated</span>
                </div>

                <div className="bg-bg-elevated border border-border rounded-lg p-4 space-y-2">
                  <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Access URL — share this link</p>
                  <input
                    readOnly
                    value={created.access_url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2
                      font-mono text-accent-cyan text-xs focus:outline-none focus:border-accent-cyan/50"
                  />
                  <p className="text-text-muted text-[10px]">
                    Anyone with this link can access the platform
                    {created.max_uses ? ` (up to ${created.max_uses} times)` : ''}.
                  </p>
                </div>

                <button
                  onClick={copyUrl}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                    bg-bg-elevated border border-border text-text-secondary hover:text-emerald-400
                    hover:border-emerald-700 transition-all font-mono text-sm"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-accent-cyan text-bg-primary font-mono
                    font-semibold text-sm hover:bg-cyan-400 transition-all"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-4">
                {mut.isError && (
                  <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-2.5 text-red-300 text-xs font-mono">
                    {(mut.error as { message?: string })?.message ?? 'Failed to generate link.'}
                  </div>
                )}

                <div>
                  <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                    Label <span className="text-text-muted normal-case tracking-normal">— optional</span>
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Research Partner – May 2026"
                    className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                      text-text-primary font-mono text-sm placeholder:text-text-muted
                      focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                      Expires In (hrs)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={expiresHours}
                      onChange={(e) => setExpiresHours(e.target.value)}
                      placeholder="72"
                      className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                        text-text-primary font-mono text-sm placeholder:text-text-muted
                        focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                        text-text-primary font-mono text-sm placeholder:text-text-muted
                        focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg bg-bg-elevated border border-border
                      text-text-secondary hover:text-text-primary font-mono text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => mut.mutate()}
                    disabled={mut.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                      bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
                      hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {mut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : 'Generate'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
