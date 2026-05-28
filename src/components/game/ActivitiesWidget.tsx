'use client'
import { useState } from 'react'
import { ScheduledActivity } from '@/lib/types'

const NEED_ICONS: Record<string, string> = {
  hunger: '🍽️', medication: '💊', hygiene: '🚿', entertainment: '📺', companionship: '💛',
}

interface Props {
  activities: ScheduledActivity[]
  onComplete: (id: string) => Promise<void>
}

export default function ActivitiesWidget({ activities, onComplete }: Props) {
  const [completing, setCompleting] = useState<string | null>(null)
  const pending = activities.filter(a => !a.completed_at)
  if (pending.length === 0) return null

  async function handleComplete(id: string) {
    setCompleting(id)
    await onComplete(id)
    setCompleting(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {pending.map(a => (
        <div key={a.id} className="rounded-2xl overflow-hidden animate-slide-up"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-green-300 font-black text-sm leading-tight">{a.label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {a.affects_need && (
                  <span className="text-[10px] text-slate-400">
                    {NEED_ICONS[a.affects_need]} +{a.affects_boost} a todos
                  </span>
                )}
                <span className="text-[10px] text-amber-400">+{a.reward_money}€</span>
                <span className="text-[10px] text-blue-400">+{a.reward_xp}XP</span>
              </div>
            </div>
            <button
              onClick={() => handleComplete(a.id)}
              disabled={completing === a.id}
              className="px-3 py-2 rounded-xl text-xs font-black active:scale-95 transition-all disabled:opacity-50 shrink-0"
              style={{ background: 'rgba(34,197,94,0.25)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac' }}>
              {completing === a.id ? '⏳' : '▶ Iniciar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
