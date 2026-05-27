'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const EVENT_LABELS: Record<string, { icon: string; label: string; xp: number; reward: number }> = {
  fallen:       { icon: '🤕', label: 'se ha caído',             xp: 15, reward: 0 },
  medication:   { icon: '💊', label: 'rechaza la medicación',   xp: 10, reward: 0 },
  hygiene:      { icon: '🚿', label: 'necesita higiene urgente', xp: 10, reward: 0 },
  locked_in:    { icon: '🔒', label: 'se ha encerrado',         xp: 20, reward: 50 },
  missing:      { icon: '🚶', label: 'ha salido solo al jardín', xp: 25, reward: 100 },
  tv_dispute:   { icon: '📺', label: 'disputa por la tele',     xp: 5,  reward: 0 },
  hunger:       { icon: '🍽️', label: 'no ha comido',             xp: 10, reward: 0 },
  companionship:{ icon: '🤝', label: 'pide compañía',           xp: 8,  reward: 50 },
}

interface Props {
  events: any[]
  residenceId: string
}

export default function EventsPanel({ events, residenceId }: Props) {
  const [resolving, setResolving] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function resolve(event: any) {
    setResolving(event.id)
    const meta = EVENT_LABELS[event.type] || { xp: 5, reward: 0 }

    await supabase.from('events').update({ resolved_at: new Date().toISOString() }).eq('id', event.id)
    await supabase.rpc('resolve_event', { p_residence_id: residenceId, p_xp: meta.xp, p_reward: meta.reward })

    setResolving(null)
    router.refresh()
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">😌</div>
        <p className="text-amber-500 font-medium">Todo tranquilo por ahora.</p>
        <p className="text-amber-700 text-sm mt-1">JR se merece un café.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-red-400 font-semibold text-sm">{events.length} urgencia{events.length !== 1 ? 's' : ''} pendiente{events.length !== 1 ? 's' : ''}</h2>

      {events.map(event => {
        const meta = EVENT_LABELS[event.type] || { icon: '⚠️', label: 'problema desconocido', xp: 5, reward: 0 }
        return (
          <div key={event.id} className="card border-red-800/60">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <p className="text-amber-200 font-semibold text-sm">{event.residents?.name}</p>
                <p className="text-amber-500 text-xs">{meta.label}</p>
              </div>
            </div>
            <button
              onClick={() => resolve(event)}
              disabled={resolving === event.id}
              className="btn-primary w-full text-sm py-2"
            >
              {resolving === event.id ? 'Resolviendo...' : `Atender (+${meta.xp} XP)`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
