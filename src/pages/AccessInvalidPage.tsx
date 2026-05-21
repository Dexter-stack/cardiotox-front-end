import { ShieldX } from 'lucide-react'

export function AccessInvalidPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
          bg-red-950/60 border border-red-700/40">
          <ShieldX className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-text-primary font-semibold text-xl">No Access Token</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            You need a valid access link to use this platform.
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl px-5 py-4 text-left space-y-1">
          <p className="text-text-muted text-[10px] font-mono uppercase tracking-widest">How to get access</p>
          <p className="text-text-secondary text-sm">
            Contact your CardioToxAI administrator to receive a personalised access link.
          </p>
        </div>
      </div>
    </div>
  )
}
