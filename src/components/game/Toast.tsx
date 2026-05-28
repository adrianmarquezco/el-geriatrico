'use client'
import { Toast } from '@/lib/types'

const TOAST_CFG: Record<string, { icon: string; bg: string; border: string; color: string; glow: string }> = {
  money:   { icon: '💰', bg: 'rgba(9,20,9,0.97)',   border: 'rgba(34,197,94,0.5)',  color: '#4ade80', glow: '34,197,94'   },
  xp:      { icon: '🧠', bg: 'rgba(14,9,30,0.97)',  border: 'rgba(139,92,246,0.5)', color: '#a78bfa', glow: '139,92,246'  },
  success: { icon: '✅', bg: 'rgba(9,17,9,0.97)',   border: 'rgba(34,197,94,0.4)',  color: '#86efac', glow: '34,197,94'   },
  warning: { icon: '⚠️', bg: 'rgba(20,8,8,0.97)',   border: 'rgba(239,68,68,0.5)',  color: '#fca5a5', glow: '239,68,68'   },
  new:     { icon: '🎉', bg: 'rgba(9,15,25,0.97)',  border: 'rgba(96,165,250,0.5)', color: '#93c5fd', glow: '96,165,250'  },
  story:   { icon: '📖', bg: 'rgba(16,10,3,0.97)',  border: 'rgba(245,158,11,0.5)', color: '#fcd34d', glow: '245,158,11'  },
  mission: { icon: '🎯', bg: 'rgba(18,14,3,0.97)',  border: 'rgba(234,179,8,0.5)',  color: '#fde047', glow: '234,179,8'   },
}

const DEFAULT_CFG = { icon: '📢', bg: 'rgba(9,11,20,0.97)', border: 'rgba(255,255,255,0.2)', color: '#e2e8f0', glow: '255,255,255' }

interface Props { toasts: Toast[] }

export default function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed top-[68px] left-1/2 -translate-x-1/2 z-[99] flex flex-col gap-1.5 pointer-events-none w-full max-w-xs px-4">
      {toasts.map(t => {
        const cfg = TOAST_CFG[t.type] ?? DEFAULT_CFG
        return (
          <div key={t.id} className="animate-slide-up"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 14,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 14px rgba(${cfg.glow},0.15)`,
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
            <span className="text-base leading-none shrink-0">{cfg.icon}</span>
            <span className="text-sm font-bold leading-tight" style={{ color: cfg.color }}>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
