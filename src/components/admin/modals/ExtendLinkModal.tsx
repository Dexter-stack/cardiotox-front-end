import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Clock } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { extendAccessLink } from '../../../api/adminClient'
import type { AccessLink } from '../../../types/access'

interface ExtendLinkModalProps {
  link: AccessLink
  onClose: () => void
}

export function ExtendLinkModal({ link, onClose }: ExtendLinkModalProps) {
  const qc = useQueryClient()
  const [hours, setHours] = useState('720')

  const mut = useMutation({
    mutationFn: () => extendAccessLink(link.id, { expires_in_hours: Number(hours) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-links'] })
      onClose()
    },
  })

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
        className="w-full max-w-sm bg-bg-card border border-border rounded-2xl shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <span className="text-text-primary font-semibold text-sm">Extend Link</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-text-secondary text-xs font-mono truncate" title={link.description}>
            {link.description}
          </p>

          {mut.isError && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-2.5
              text-red-300 text-xs font-mono">
              {(mut.error as { message?: string })?.message ?? 'Failed to extend link.'}
            </div>
          )}

          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
              Extend by (hours)
            </label>
            <input
              type="number"
              min="1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                text-text-primary font-mono text-sm
                focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
                transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-bg-elevated border border-border
                text-text-secondary hover:text-text-primary font-mono text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending || !hours || Number(hours) < 1}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
                hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mut.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Extending…</>
              ) : (
                'Extend'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
