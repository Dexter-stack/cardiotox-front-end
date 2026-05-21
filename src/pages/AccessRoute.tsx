/**
 * AccessRoute — handles /access/:token
 * Validates the token, shows Access Denied if invalid, stores + redirects if valid.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ShieldX, ShieldCheck, Clock, Ban, Hash } from 'lucide-react'
import { validateToken } from '../api/client'
import type { AccessDeniedReason } from '../types/access'

export const ACCESS_TOKEN_KEY = 'accessToken'

type Status = 'validating' | 'success' | 'denied'

const REASON_META: Record<AccessDeniedReason, { icon: React.FC<{ className?: string }>; title: string; body: string }> = {
  expired:       { icon: Clock,   title: 'Link Expired',      body: 'This access link has expired. Contact the administrator for a new link.' },
  revoked:       { icon: Ban,     title: 'Link Revoked',       body: 'This access link has been revoked. Contact the administrator.' },
  not_found:     { icon: ShieldX, title: 'Invalid Link',       body: 'This access link is not recognised. Check the URL and try again.' },
  limit_reached: { icon: Hash,    title: 'Usage Limit Reached', body: 'This access link has reached its maximum number of uses.' },
}

export function AccessRoute() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('validating')
  const [reason, setReason] = useState<AccessDeniedReason | null>(null)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      navigate('/access/invalid', { replace: true })
      return
    }

    validateToken(token)
      .then((res) => {
        if (res.valid) {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
          setLabel(res.label)
          setStatus('success')
          setTimeout(() => navigate('/', { replace: true }), 1400)
        } else {
          setReason(res.reason)
          setStatus('denied')
        }
      })
      .catch(() => {
        setReason('not_found')
        setStatus('denied')
      })
  }, [token, navigate])

  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-accent-cyan animate-spin mx-auto" />
          <p className="text-text-secondary font-mono text-sm">Validating access link…</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-emerald-950/60 border border-emerald-700/40 mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-text-primary font-semibold text-lg">Access Granted</h1>
            {label && <p className="text-text-muted font-mono text-sm">{label}</p>}
          </div>
          <p className="text-text-muted font-mono text-xs">Redirecting to platform…</p>
        </div>
      </div>
    )
  }

  // denied
  const meta = REASON_META[reason ?? 'not_found']
  const Icon = meta.icon

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
          bg-red-950/60 border border-red-700/40">
          <Icon className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-text-primary font-semibold text-xl">Access Denied</h1>
          <p className="text-red-300 font-mono font-semibold text-sm">{meta.title}</p>
          <p className="text-text-muted text-sm leading-relaxed">{meta.body}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl px-5 py-4 text-left space-y-1">
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Need access?</p>
          <p className="text-text-secondary text-sm">
            Contact your CardioToxAI administrator to generate a new access link.
          </p>
        </div>
      </div>
    </div>
  )
}
