'use client'
import { useState } from 'react'
import { Resident, GameEvent } from '@/lib/types'
import ResidentPin from './ResidentPin'

export const ROOM_META: Record<string, { icon: string; label: string; bg: string; floor: string }> = {
  bedroom:       { icon: '🛏️', label: 'Habitación',   bg: 'bg-blue-950/50',   floor: 'border-blue-800/40'   },
  tv_room:       { icon: '📺', label: 'Sala TV',       bg: 'bg-purple-950/50', floor: 'border-purple-800/40' },
  dining_room:   { icon: '🍽️', label: 'Comedor',       bg: 'bg-orange-950/50', floor: 'border-orange-800/40' },
  garden:        { icon: '🌳', label: 'Jardín',        bg: 'bg-green-950/50',  floor: 'border-green-800/40'  },
  infirmary:     { icon: '🏥', label: 'Enfermería',    bg: 'bg-red-950/50',    floor: 'border-red-800/40'    },
  chapel:        { icon: '⛪', label: 'Capilla',       bg: 'bg-yellow-950/50', floor: 'border-yellow-800/40' },
  barbershop:    { icon: '💈', label: 'Peluquería',    bg: 'bg-pink-950/50',   floor: 'border-pink-800/40'   },
  cards_room:    { icon: '🃏', label: 'Sala cartas',   bg: 'bg-indigo-950/50', floor: 'border-indigo-800/40' },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia',  bg: 'bg-teal-950/50',   floor: 'border-teal-800/40'   },
}

const EVENT_OVERLAY: Record<string, { emoji: string; label: string; color: string }> = {
  hygiene:        { emoji: '💧',   label: 'charco en el suelo',     color: 'bg-blue-900/80'   },
  fallen:         { emoji: '🩹',   label: 'alguien se ha caído',    color: 'bg-red-900/80'    },
  tv_dispute:     { emoji: '📺💥', label: 'bronca por la tele',     color: 'bg-purple-900/80' },
  missing:        { emoji: '🚪❓', label: 'ha salido solo',         color: 'bg-amber-900/80'  },
  hunger:         { emoji: '🍽️',  label: 'sin comer',               color: 'bg-orange-900/80' },
  medication:     { emoji: '💊',  label: 'sin medicación',          color: 'bg-pink-900/80'   },
  companionship:  { emoji: '💔',  label: 'pide compañía',           color: 'bg-rose-900/80'   },
  entertainment:  { emoji: '😴',  label: 'muy aburrido',            color: 'bg-slate-900/80'  },
  locked_in:      { emoji: '🔒',  label: 'encerrado por dentro',    color: 'bg-zinc-900/80'   },
  family_visit:   { emoji: '👨‍👩‍👧',  label: 'visita de la familia',   color: 'bg-pink-900/80'   },
}

interface Props {
  roomType: string
  roomIndex?: number
  assignedResident?: Resident | null
  residents: Resident[]
  events: GameEvent[]
  onResolve: (eventId: string) => Promise<void>
  fullWidth?: boolean
}

export default function RoomCell({ roomType, roomIndex = 0, assignedResident, residents, events, onResolve, fullWidth }: Props) {
  const [resolving, setResolving] = useState<string | null>(null)
  const meta = ROOM_META[roomType] || { icon: '🏠', label: 'Sala', bg: 'bg-amber-950/50', floor: 'border-amber-800/40' }

  const hasCritical = events.some(e => e.urgency === 'critical')
  const residentHasEvent = (residentId: string) => events.some(e => e.resident_id === residentId)

  async function handleResolve(eventId: string) {
    setResolving(eventId)
    await onResolve(eventId)
    setResolving(null)
  }

  // For bedrooms: show assigned resident name plate even if they're away
  const isOccupied = roomType === 'bedroom' ? !!assignedResident : residents.length > 0

  return (
    <div className={`
      relative rounded-2xl border overflow-hidden
      ${meta.bg} ${meta.floor}
      ${hasCritical ? 'ring-2 ring-red-500/70 ring-offset-1 ring-offset-amber-950' : ''}
      ${fullWidth ? 'col-span-2' : ''}
      min-h-[130px] flex flex-col
    `}>
      {/* Room header */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
        <span className="text-base">{meta.icon}</span>
        <span className="text-amber-300 text-xs font-semibold">{meta.label}{roomType === 'bedroom' && roomIndex > 0 ? ` ${roomIndex + 1}` : ''}</span>
        {events.length > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${hasCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-700 text-orange-200'}`}>
            {events.length}
          </span>
        )}
      </div>

      {/* Room content */}
      <div className="flex-1 px-2 pb-2">
        {/* Residents in room */}
        <div className="flex flex-wrap gap-2 mb-2">
          {roomType === 'bedroom' ? (
            assignedResident ? (
              residents.some(r => r.id === assignedResident.id) ? (
                // Resident is in their bedroom
                <div className="flex flex-col gap-1">
                  <ResidentPin
                    resident={assignedResident}
                    hasEvent={residentHasEvent(assignedResident.id)}
                  />
                  <p className="text-amber-600 text-[9px] italic text-center leading-tight max-w-[72px]">
                    {assignedResident.activity}
                  </p>
                </div>
              ) : (
                // Resident is out of their bedroom
                <div className="flex flex-col items-center gap-0.5 opacity-40">
                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-amber-700 flex items-center justify-center">
                    <span className="text-amber-700 text-xs font-bold">{assignedResident.name[0]}</span>
                  </div>
                  <p className="text-amber-700 text-[9px]">fuera</p>
                </div>
              )
            ) : (
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-amber-800/40 flex items-center justify-center">
                <span className="text-amber-800 text-sm">💤</span>
              </div>
            )
          ) : (
            residents.length === 0 ? (
              <p className="text-amber-800/60 text-[10px] italic">nadie aquí</p>
            ) : (
              residents.map(r => (
                <div key={r.id} className="flex flex-col gap-0.5 items-center">
                  <ResidentPin resident={r} hasEvent={residentHasEvent(r.id)} />
                  <p className="text-amber-600 text-[9px] italic text-center leading-tight max-w-[72px]">
                    {r.activity}
                  </p>
                </div>
              ))
            )
          )}
        </div>

        {/* Event overlays — tappable */}
        {events.length > 0 && (
          <div className="flex flex-col gap-1">
            {events.map(event => {
              const ov = EVENT_OVERLAY[event.type] || { emoji: '⚠️', label: 'problema', color: 'bg-amber-900/80' }
              return (
                <button
                  key={event.id}
                  onClick={() => handleResolve(event.id)}
                  disabled={resolving === event.id}
                  className={`
                    w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left
                    ${ov.color} border border-white/10
                    ${event.urgency === 'critical' ? 'animate-pulse' : ''}
                    active:scale-95 transition-transform disabled:opacity-50
                  `}
                >
                  <span className="text-sm animate-event">{ov.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[10px] font-semibold leading-tight">{event.residents?.name}</p>
                    <p className="text-white/70 text-[9px] leading-tight truncate">{ov.label}</p>
                  </div>
                  <span className="text-white/60 text-[10px] shrink-0">
                    {resolving === event.id ? '...' : '👆'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
