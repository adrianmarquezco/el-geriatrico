'use client'
import { useState } from 'react'
import { GameEvent } from '@/lib/types'

const EVENT_META: Record<string, { icon: string; label: string; xp: number; color: string; glow: string }> = {
  fallen:        { icon: '🩹', label: 'Se ha caído',              xp: 15, color: '#f87171', glow: '239,68,68'   },
  medication:    { icon: '💊', label: 'Rechaza la medicación',    xp: 10, color: '#f472b6', glow: '236,72,153'  },
  hygiene:       { icon: '💧', label: 'Higiene urgente',          xp: 10, color: '#60a5fa', glow: '96,165,250'  },
  locked_in:     { icon: '🔒', label: 'Se ha encerrado',          xp: 20, color: '#94a3b8', glow: '100,116,139' },
  missing:       { icon: '❓', label: 'Ha salido solo',           xp: 25, color: '#fbbf24', glow: '251,191,36'  },
  tv_dispute:    { icon: '📺', label: 'Pelea por la tele',        xp: 5,  color: '#c084fc', glow: '192,132,252' },
  hunger:        { icon: '🍽️', label: 'No ha comido',             xp: 10, color: '#fb923c', glow: '251,146,60'  },
  companionship: { icon: '💔', label: 'Pide compañía',            xp: 8,  color: '#fb7185', glow: '251,113,133' },
  entertainment: { icon: '😴', label: 'Muy aburrido',             xp: 8,  color: '#94a3b8', glow: '148,163,184' },
  family_visit:  { icon: '👨‍👩‍👧', label: 'Visita familiar',        xp: 12, color: '#f9a8d4', glow: '249,168,212' },
  inspection:    { icon: '🔍', label: 'Inspector Ramírez',        xp: 20, color: '#60a5fa', glow: '96,165,250'  },
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
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          😌
        </div>
        <div>
          <p className="text-green-400 font-black text-base">Todo tranquilo</p>
          <p className="text-slate-600 text-sm mt-0.5">JR se merece un descanso</p>
        </div>
        <div className="flex gap-2 mt-2">
          {['⚡','☕','📰'].map((e, i) => (
            <span key={i} className="text-2xl opacity-40">{e}</span>
          ))}
        </div>
      </div>
    )
  }

  const critical = events.filter(e => e.urgency === 'critical')
  const normal   = events.filter(e => e.urgency !== 'critical')

  return (
    <div className="flex flex-col gap-2.5">
      {critical.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-sm font-black uppercase tracking-widest">Crítico</span>
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">{critical.length}</span>
          </div>
          {critical.map(ev => <EventCard key={ev.id} event={ev} resolving={resolving} onResolve={handleResolve} />)}
        </>
      )}
      {normal.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-amber-400 text-sm font-black uppercase tracking-widest">Pendiente</span>
            <span className="w-5 h-5 rounded-full text-amber-950 text-[10px] font-black flex items-center justify-center" style={{ background: '#fbbf24' }}>{normal.length}</span>
          </div>
          {normal.map(ev => <EventCard key={ev.id} event={ev} resolving={resolving} onResolve={handleResolve} />)}
        </>
      )}
    </div>
  )
}

function EventCard({ event, resolving, onResolve }: {
  event: GameEvent; resolving: string | null; onResolve: (id: string) => void
}) {
  const meta = EVENT_META[event.type] ?? { icon: '⚠️', label: 'Problema', xp: 5, color: '#94a3b8', glow: '148,163,184' }
  const isCritical = event.urgency === 'critical'
  const isResolving = resolving === event.id
  const maxTicks = isCritical ? 8 : 4
  const pct = event.unresolved_ticks > 0
    ? Math.max(0, 100 - (event.unresolved_ticks / maxTicks) * 100)
    : 100
  const urgencyColor = pct > 60 ? meta.color : pct > 30 ? '#fbbf24' : '#ef4444'

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg,rgba(${meta.glow},0.1) 0%,rgba(9,11,20,0.95) 100%)`,
        border: `1px solid rgba(${meta.glow},${isCritical ? '0.45' : '0.25'})`,
        boxShadow: isCritical ? `0 0 18px 2px rgba(${meta.glow},0.18)` : 'none',
      }}>

      {/* Urgency time bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${urgencyColor},${urgencyColor}88)` }} />
      </div>

      <div className="p-3 pt-3.5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{
              background: `rgba(${meta.glow},0.15)`,
              border: `1px solid rgba(${meta.glow},0.3)`,
              boxShadow: isCritical ? `0 0 12px rgba(${meta.glow},0.3)` : 'none',
            }}>
            <span className={isCritical ? 'animate-event' : ''}>{meta.icon}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-slate-200 font-black text-sm leading-tight truncate">
                {event.type === 'inspection' ? 'Inspector Ramírez' : event.residents?.name}
              </p>
              {isCritical && (
                <span className="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">!</span>
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: `rgba(${meta.glow},0.85)` }}>{meta.label}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] text-slate-600">+{meta.xp} XP</span>
              <span className="text-[9px] text-slate-700">·</span>
              <span className="text-[9px] font-medium" style={{ color: urgencyColor }}>
                {pct > 70 ? 'Normal' : pct > 35 ? 'Urgente' : '¡Crítico!'}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => onResolve(event.id)}
            disabled={isResolving}
            className="shrink-0 w-14 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform disabled:opacity-40"
            style={{
              background: `rgba(${meta.glow},0.2)`,
              border: `1px solid rgba(${meta.glow},0.45)`,
            }}>
            <span className="text-xl leading-none">{isResolving ? '⏳' : '👆'}</span>
            <span className="text-[8px] font-black" style={{ color: meta.color }}>
              {isResolving ? '...' : 'Atender'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
