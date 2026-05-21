import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAdmin } from '../../../api/adminClient'

interface CreateAdminModalProps {
  onClose: () => void
}

export function CreateAdminModal({ onClose }: CreateAdminModalProps) {
  const qc = useQueryClient()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSuperadmin, setIsSuperadmin] = useState(false)

  const mut = useMutation({
    mutationFn: () => createAdmin({ username, email, password, is_superadmin: isSuperadmin }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-admins'] })
      onClose()
    },
  })

  const valid = username.trim() && email.trim() && password.trim()

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
            <UserPlus className="w-4 h-4 text-accent-cyan" />
            <span className="text-text-primary font-semibold text-sm">Create Admin</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {mut.isError && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-2.5
              text-red-300 text-xs font-mono">
              {(mut.error as { message?: string })?.message ?? 'Failed to create admin.'}
            </div>
          )}

          {[
            { label: 'Username', value: username, set: setUsername, type: 'text', placeholder: 'admin_user' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'admin@example.com' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5
                  text-text-primary font-mono text-sm placeholder:text-text-muted
                  focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
                  transition-colors"
              />
            </div>
          ))}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSuperadmin}
              onChange={(e) => setIsSuperadmin(e.target.checked)}
              className="w-4 h-4 rounded accent-cyan-400"
            />
            <span className="text-text-secondary text-xs font-mono">Grant superadmin privileges</span>
          </label>

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
              disabled={mut.isPending || !valid}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
                hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mut.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
