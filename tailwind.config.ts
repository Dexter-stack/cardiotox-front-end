import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          card: '#1a2235',
          elevated: '#1e2d45',
        },
        border: {
          DEFAULT: '#1e2d45',
          subtle: '#162032',
          bright: '#2a3f5f',
        },
        accent: {
          cyan: '#00d4ff',
          'cyan-dim': '#0099cc',
          'cyan-glow': 'rgba(0, 212, 255, 0.15)',
        },
        // Per-threshold risk level colours (updated: Minimal → green)
        risk: {
          minimal: '#10b981',
          low: '#4ade80',
          moderate: '#eab308',
          high: '#f97316',
          'very-high': '#dc2626',
        },
        // Score-based overall-risk labels (0-25 / 25-50 / 50-75 / 75-100)
        score: {
          low: '#10b981',
          moderate: '#eab308',
          high: '#f97316',
          critical: '#dc2626',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan':    '0 0 20px rgba(0, 212, 255, 0.2), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-cyan-sm': '0 0 8px rgba(0, 212, 255, 0.3)',
        'glow-red':     '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-green':   '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-orange':  '0 0 20px rgba(249, 115, 22, 0.25)',
        card:           '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':   '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'gauge-fill': 'gaugeFill 1.2s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        gaugeFill: {
          from: { strokeDashoffset: '282.74' },
          to:   { strokeDashoffset: 'var(--gauge-offset)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
