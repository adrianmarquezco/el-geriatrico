'use client'
import { useState } from 'react'
import { GameEvent } from '@/lib/types'

const EVENT_META: Record<string, { icon: string; label: string; xp: number; reward?: number }> = {
  fallen:        { icon: '🤕', label: 'se ha caído',              xp: 15 },
  medication:    { icon: '💊', label: 'rechaza la medicación',    xp: 10 },
  hygiene:       { icon: '🚿', label: 'necesita higiene urgente', xp: 10 },
  locked_in:     { icon: '🔒', label: 'se ha encerrado',          xp: 20 },
  missing:       { icon: '🚶', label: 'ha salido solo al jardín', xp: 25 },
  tv_dispute:    { icon: '📺', label: 'disputa por la tele',      xp: 5  },
  hunger:        { icon: '🍽️', label: 'no ha comido',             xp: 10 },
  companionship: { icon: '🤝', label: 'pide compañía',            xp: 8  },
  entertainment: { icon: '🎮', label: 'está muy aburrido',        xp: 8  },
  family_visit:  { icon: '👨‍👩‍👧', label: 'visita de la familia',    xp: 12, reward: 200 },
}

interface Props {
  events: GameEvent[]
  onResolve: (eventId: string) => Promise<void>
}

export default function EventsPanel({ events, onResolve }: Props) {
  const [resolving, setResolving] = useState<string | null>(null)

  async function handleResolve(eventId: string) {
    setResolving(eventId)
    await onResolve(eventId)
    setResolving(null)
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">😌</div>
        <p className="text-amber-400 font-semibold">Todo tranquilo.</p>
        <p className="text-amber-700 text-sm mt-1">JR se merece un café.</p>
      </div>
    )
  }

  const critical = events.filter(e => e.urgency === 'critical')
  const normal   = events.filter(e => e.urgency !== 'critical')

  return (
    <div className="flex flex-col gap-3">
      {critical.length > 0 && (
        <>
          <h2 className="text-red-400 font-bold text-sm uppercase tracking-wide">🚨 Crítico</h2>
          {critical.map(event => <EventCard key={event.id} event={event} resolving={resolving} onResolve={handleResolve} />)}
        </>
      )}
      {normal.length > 0 && (
        <>
          <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wide mt-1">⚠️ Pendiente</h2>
          {normal.map(event => <EventCard key={event.id} event={event} resolving={resolving} onResolve={handleResolve} />)}
        </>
      )}
    </div>
  )
}

function EventCard({ event, resolving, onResolve }: { event: GameEvent; resolving: string | null; onResolve: (id: string) => void }) {
  const meta = EVENT_META[event.type] || { icon: '⚠️', label: 'problema desconocido', xp: 5 }
  const isCritical = event.urgency === 'critical'

  return (
    <div className={`card ${isCritical ? 'border-red-600/60 bg-red-950/30' : 'border-orange-800/40'}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{meta.icon}</span>
        <div className="flex-1">
          <p className="text-amber-200 font-bold text-sm">{event.residents?.name}</p>
          <p className="text-amber-500 text-xs">{meta.label}</p>
        </div>
        {isCritical && <span className="badge bg-red-900 text-red-300">CRÍTICO</span>}
      </div>
      <button
        onClick={() => onResolve(event.id)}
        disabled={resolving === event.id}
        className={`w-full text-sm py-2.5 rounded-xl font-bold transition-all ${
          event.type === 'family_visit'
            ? 'bg-pink-700 hover:bg-pink-600 text-white'
            : isCritical
            ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white'
            : 'btn-primary'
        } disabled:opacity-50`}
      >
        {resolving === event.id ? '...' : event.type === 'family_visit' ? `Recibir visita · +${meta.xp} XP` : `Atender · +${meta.xp} XP`}
      </button>
    </div>
  )
}
