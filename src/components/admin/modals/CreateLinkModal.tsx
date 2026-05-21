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
  const [description, setDescription] = useState('')
  const [expiresHours, setExpiresHours] = useState('')
  const [created, setCreated] = useState<AccessLink | null>(null)
  const [copied, setCopied] = useState(false)

  const mut = useMutation({
    mutationFn: () =>
      createAccessLink({
        description: description.trim(),
        expires_in_hours: expiresHours ? Number(expiresHours) : null,
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-accent-cyan" />
            <span className="text-text-primary font-semibold text-sm">Create Access Link</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {created ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-mono text-sm font-medium">Link created successfully</span>
                </div>
                <div className="bg-bg-elevated border border-border rounded-lg p-4 space-y-2">
                  <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Access URL</p>
                  <p className="font-mono text-accent-cyan text-xs break-all">{created.access_url}</p>
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
                  <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-2.5
                    text-red-300 text-xs font-mono">
                    {(mut.error as { message?: string })?.message ?? 'Failed to create link.'}
                  </div>
                )}

                <div>
                  <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Researcher A access"
                    className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                      text-text-primary font-mono text-sm placeholder:text-text-muted
                      focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
                      transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                    Expires In (hours) <span className="text-text-muted normal-case tracking-normal">— leave blank for no expiry</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expiresHours}
                    onChange={(e) => setExpiresHours(e.target.value)}
                    placeholder="e.g. 720"
                    className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                      text-text-primary font-mono text-sm placeholder:text-text-muted
                      focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
                      transition-colors"
                  />
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
                    disabled={mut.isPending || !description.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                      bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
                      hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {mut.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                    ) : (
                      'Create Link'
                    )}
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
