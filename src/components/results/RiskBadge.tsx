/**
 * RiskBadge — coloured pill label for per-threshold risk levels.
 * Minimal → Green | Moderate → Yellow | High → Orange | Very High → Red
 */

import type { RiskLevel } from '../../types/prediction'
import { RISK_BG_CLASSES } from '../../utils/riskColors'

interface RiskBadgeProps {
  risk: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  /** Show a leading colour dot */
  dot?: boolean
}

const SIZE_CLASSES: Record<NonNullable<RiskBadgeProps['size']>, string> = {
  sm: 'text-[10px] px-2    py-0.5 gap-1',
  md: 'text-xs    px-2.5  py-1   gap-1.5',
  lg: 'text-sm    px-3.5  py-1.5 gap-2 font-semibold',
}

// Dot colour that matches the badge text colour
const DOT_COLOR_CLASSES: Record<RiskLevel, string> = {
  'Minimal':   'bg-emerald-400',
  'Low':       'bg-green-400',
  'Moderate':  'bg-yellow-400',
  'High':      'bg-orange-400',
  'Very High': 'bg-red-400',
}

export function RiskBadge({ risk, size = 'md', dot = false }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-medium tracking-wide
        ${RISK_BG_CLASSES[risk]} ${SIZE_CLASSES[size]}`}
    >
      {dot && (
        <span className={`inline-block rounded-full ${DOT_COLOR_CLASSES[risk]} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      )}
      {risk}
    </span>
  )
}
