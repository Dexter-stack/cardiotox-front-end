/**
 * AccessRoute — handles /access/:token
 * Auto-validates the token from the URL, stores it on success, redirects to /.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { validateToken } from '../api/client'
import { ACCESS_TOKEN_KEY } from '../components/access/AccessGate'

type Status = 'validating' | 'success' | 'error'

export function AccessRoute() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('validating')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No token provided.')
      return
    }

    validateToken(token)
      .then((result) => {
        if (result.valid) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token)
          setStatus('success')
          setTimeout(() => navigate('/', { replace: true }), 1200)
        } else {
          setStatus('error')
          setErrorMsg('This access token is invalid or has expired.')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('This access token is invalid or has expired.')
      })
  }, [token, navigate])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        {status === 'validating' && (
          <>
            <Loader2 className="w-10 h-10 text-accent-cyan animate-spin mx-auto" />
            <p className="text-text-secondary font-mono text-sm">Validating access token…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-text-primary font-mono text-sm">Access granted — redirecting…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-300 font-mono text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="text-accent-cyan font-mono text-xs hover:underline"
            >
              Go to home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
