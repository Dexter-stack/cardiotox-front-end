import { useState } from 'react'
import { ShieldCheck, Loader2, AlertCircle, Lock } from 'lucide-react'
import { validateToken } from '../../api/client'

const ACCESS_TOKEN_KEY = 'cardiotox_access_token'

interface AccessGateProps {
  onSuccess: () => void
}

export function AccessGate({ onSuccess }: AccessGateProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const result = await validateToken(trimmed)
      if (result.valid) {
        localStorage.setItem(ACCESS_TOKEN_KEY, trimmed)
        onSuccess()
      } else {
        setError('Invalid or expired access token.')
      }
    } catch {
      setError('Invalid or expired access token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
            bg-accent-cyan-glow border border-accent-cyan/30 mb-4">
            <Lock className="w-6 h-6 text-accent-cyan" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">CardioToxAI</h1>
          <p className="text-text-muted text-sm font-mono">Enter your access token to continue</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card"
        >
          <div>
            <label htmlFor="access-token" className="block text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">
              Access Token
            </label>
            <input
              id="access-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your token here…"
              disabled={loading}
              autoFocus
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3
                text-text-primary font-mono text-sm placeholder:text-text-muted
                focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30
                disabled:opacity-50 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-700/50
              rounded-lg px-4 py-3 text-red-300 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg
              bg-accent-cyan text-bg-primary font-mono font-semibold text-sm
              hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Access Platform
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export { ACCESS_TOKEN_KEY }
