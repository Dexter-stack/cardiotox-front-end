import { useQuery } from '@tanstack/react-query'
import { Activity, Zap } from 'lucide-react'
import { checkHealth } from '../../api/client'

export function Header() {
  const { data: health, isError } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    refetchInterval: 30_000,
    retry: 1,
  })

  const online = !isError && health?.model_loaded === true

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-secondary border-b border-border flex items-center px-4 sm:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded bg-accent-cyan-glow border border-accent-cyan flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent-cyan" />
        </div>
        <span className="font-mono text-base sm:text-xl font-semibold tracking-tight">
          <span className="text-accent-cyan">hERG</span>
          <span className="text-text-secondary">·</span>
          <span className="text-text-primary">Tox</span>
        </span>
      </div>

      {/* Center title — hidden on small screens */}
      <div className="flex-1 text-center hidden sm:block">
        <span className="text-text-secondary text-xs sm:text-sm font-medium tracking-widest uppercase">
          Cardiotoxicity Prediction Platform
        </span>
      </div>

      {/* Health indicator */}
      <div className="ml-auto flex justify-end shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-bg-card border border-border rounded-full px-2.5 sm:px-4 py-1.5">
          <Activity className={`w-3.5 h-3.5 ${online ? 'text-emerald-400' : 'text-red-400'}`} />
          <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`hidden sm:inline text-xs font-mono font-medium ${online ? 'text-emerald-400' : 'text-red-400'}`}>
            {online ? 'Model Online' : 'Model Offline'}
          </span>
          {health?.version && (
            <span className="hidden md:inline text-text-muted text-xs font-mono">v{health.version}</span>
          )}
        </div>
      </div>
    </header>
  )
}
