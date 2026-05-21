/**
 * Hover tooltip primitive.
 * Wraps any children (or defaults to an ⓘ icon) and displays a floating
 * panel positioned above/below/left/right with a Framer Motion fade-in.
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** Tooltip body — string or rich JSX */
  content: React.ReactNode
  /** Element to trigger the tooltip. Defaults to an ⓘ Info icon. */
  children?: React.ReactNode
  /** Preferred placement */
  side?: TooltipSide
  /** Extra classes on the trigger wrapper */
  className?: string
  /** Max width of the floating panel in px (default 256) */
  maxWidth?: number
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className = '',
  maxWidth = 256,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(false), 80)
  }, [])

  // Position classes for the floating panel
  const panelPosition: Record<TooltipSide, string> = {
    top:    'bottom-full mb-2.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full  mt-2.5 left-1/2 -translate-x-1/2',
    left:   'right-full mr-2.5 top-1/2 -translate-y-1/2',
    right:  'left-full  ml-2.5 top-1/2 -translate-y-1/2',
  }

  // Arrow position & rotation
  const arrowClasses: Record<TooltipSide, string> = {
    top:    'top-full  left-1/2 -translate-x-1/2 mt-[-1px] border-t border-l rotate-[-135deg]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 mb-[-1px] border-b border-r rotate-[-135deg]',
    left:   'left-full  top-1/2  -translate-y-1/2 ml-[-1px] border-l border-b rotate-[45deg]',
    right:  'right-full top-1/2  -translate-y-1/2 mr-[-1px] border-r border-t rotate-[45deg]',
  }

  // Framer Motion initial/exit offset direction
  const motionOffset: Record<TooltipSide, { x: number; y: number }> = {
    top:    { x: 0,  y:  5 },
    bottom: { x: 0,  y: -5 },
    left:   { x:  5, y:  0 },
    right:  { x: -5, y:  0 },
  }

  const { x, y } = motionOffset[side]

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Trigger element */}
      {children ?? (
        <Info
          className="w-3.5 h-3.5 text-text-muted hover:text-accent-cyan transition-colors cursor-help"
          aria-label="More information"
        />
      )}

      {/* Floating panel */}
      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, x, y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x, y }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`absolute z-50 pointer-events-none ${panelPosition[side]}`}
            style={{ width: maxWidth }}
          >
            <div className="relative bg-bg-elevated border border-border-bright rounded-lg px-3.5 py-2.5 shadow-card">
              {/* Content */}
              <div className="text-xs text-text-secondary leading-relaxed font-sans">
                {content}
              </div>
              {/* Arrow */}
              <div
                className={`absolute w-2 h-2 bg-bg-elevated border-border-bright ${arrowClasses[side]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
