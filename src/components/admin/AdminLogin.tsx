import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { adminLogin, ADMIN_TOKEN_KEY } from '../../api/adminClient'

export function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError(null)

    try {
      const res = await adminLogin(username.trim(), password)
      localStorage.setItem(ADMIN_TOKEN_KEY, res.access_token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Incorrect username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
            bg-violet-950/60 border border-violet-700/40 mb-4">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Admin Panel</h1>
          <p className="text-text-muted text-sm font-mono">CardioToxAI administration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card"
        >
          {error && (
            <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-700/50
              rounded-lg px-4 py-3 text-red-300 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-user" className="block text-text-secondary text-xs font-mono
              uppercase tracking-widest mb-2">Username</label>
            <input
              id="admin-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              autoFocus
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3
                text-text-primary font-mono text-sm placeholder:text-text-muted
                focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30
                disabled:opacity-50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-text-secondary text-xs font-mono
              uppercase tracking-widest mb-2">Password</label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3
                text-text-primary font-mono text-sm placeholder:text-text-muted
                focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30
                disabled:opacity-50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
              bg-violet-600 text-white font-mono font-semibold text-sm
              hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              : <><ShieldCheck className="w-4 h-4" /> Sign In</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
