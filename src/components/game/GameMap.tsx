'use client'
import { useState, useEffect, useRef } from 'react'
import { Resident, GameEvent, Room, Residence } from '@/lib/types'

// ─── Visual config ────────────────────────────────────────────────
const ROOM_H = 120  // px per row
const CORRIDOR_H = 28

const ROOM_CFG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
  bedroom:       { icon: '🛏️', label: 'Hab.',          bg: '#0c1629', border: '#1e40af', text: '#93c5fd' },
  tv_room:       { icon: '📺', label: 'Sala TV',        bg: '#130a25', border: '#7c3aed', text: '#c4b5fd' },
  dining_room:   { icon: '🍽️', label: 'Comedor',        bg: '#180a00', border: '#b45309', text: '#fcd34d' },
  garden:        { icon: '🌿', label: 'Jardín',         bg: '#041a0c', border: '#15803d', text: '#86efac' },
  infirmary:     { icon: '🏥', label: 'Enfermería',     bg: '#1a0808', border: '#dc2626', text: '#fca5a5' },
  chapel:        { icon: '⛪', label: 'Capilla',        bg: '#1a1200', border: '#d97706', text: '#fde68a' },
  barbershop:    { icon: '💈', label: 'Peluquería',     bg: '#1a0a12', border: '#db2777', text: '#f9a8d4' },
  cards_room:    { icon: '🃏', label: 'Sala cartas',    bg: '#080f1e', border: '#2563eb', text: '#93c5fd' },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia',   bg: '#041616', border: '#0d9488', text: '#5eead4' },
}

const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}

const EVENT_OVERLAY: Record<string, { emoji: string; color: string }> = {
  hygiene:       { emoji: '💧', color: 'rgba(37,99,235,0.7)' },
  fallen:        { emoji: '🩹', color: 'rgba(220,38,38,0.7)' },
  tv_dispute:    { emoji: '📺💥', color: 'rgba(124,58,237,0.7)' },
  missing:       { emoji: '❓', color: 'rgba(217,119,6,0.7)' },
  hunger:        { emoji: '🍽️', color: 'rgba(180,83,9,0.7)' },
  medication:    { emoji: '💊', color: 'rgba(219,39,119,0.7)' },
  companionship: { emoji: '💔', color: 'rgba(225,29,72,0.7)' },
  entertainment: { emoji: '😴', color: 'rgba(71,85,105,0.7)' },
  locked_in:     { emoji: '🔒', color: 'rgba(100,116,139,0.7)' },
}

// ─── Layout engine ─────────────────────────────────────────────────
interface Zone {
  id: string; type: string; label: string; icon: string
  col: number; row: number; isOther: boolean
  cfg: typeof ROOM_CFG[string]
}

function buildZones(rooms: Room[]): Zone[] {
  const bedrooms = rooms.filter(r => r.type === 'bedroom')
  const rawOthers = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  // garden always last + full-width
  const others = [...rawOthers.filter(t => t !== 'garden'), ...rawOthers.filter(t => t === 'garden')]

  const zones: Zone[] = []
  bedrooms.forEach((_, i) => {
    zones.push({ id: `bedroom-${i}`, type: 'bedroom', label: bedrooms.length > 1 ? `Hab. ${i + 1}` : 'Habitación',
      icon: '🛏️', col: i % 2, row: Math.floor(i / 2), isOther: false, cfg: ROOM_CFG.bedroom })
  })
  // Empty slot if odd bedrooms
  if (bedrooms.length > 0 && bedrooms.length % 2 !== 0) {
    zones.push({ id: 'slot-empty', type: 'empty', label: '', icon: '', col: 1,
      row: Math.floor(bedrooms.length / 2), isOther: false, cfg: { icon: '', label: '', bg: '#090912', border: '#1a1a2e', text: '#333' } })
  }

  let col = 0, row = 0
  others.forEach(type => {
    const isGarden = type === 'garden'
    if (isGarden && col !== 0) { col = 0; row++ }
    zones.push({ id: type, type, label: ROOM_CFG[type]?.label || type,
      icon: ROOM_CFG[type]?.icon || '🏠', col: isGarden ? 2 : col, row,
      isOther: true, cfg: ROOM_CFG[type] || ROOM_CFG.bedroom })
    if (isGarden) { row++; col = 0 } else { col++; if (col >= 2) { col = 0; row++ } }
  })
  return zones
}

function getZonePixels(zone: Zone, bedroomRows: number, containerW: number) {
  const colW = containerW / 2
  const y = zone.isOther
    ? bedroomRows * ROOM_H + CORRIDOR_H + zone.row * ROOM_H
    : zone.row * ROOM_H
  const x = zone.col === 2 ? 0 : zone.col * colW
  const w = zone.col === 2 ? containerW : colW
  return { x, y, w, h: ROOM_H }
}

function getResidentPixels(resident: Resident, residents: Resident[], zones: Zone[], bedroomRows: number, containerW: number) {
  const resIdx = residents.findIndex(r => r.id === resident.id)
  const roomType = resident.current_room_type || 'bedroom'
  const zoneId = roomType === 'bedroom' ? `bedroom-${resIdx}` : roomType
  const zone = zones.find(z => z.id === zoneId) || zones.find(z => z.type === 'bedroom') || zones[0]
  if (!zone) return { x: 0, y: 0 }

  const px = getZonePixels(zone, bedroomRows, containerW)
  // Residents sharing a zone: spread horizontally
  const sharing = residents.filter((r, i) => {
    const rt = r.current_room_type || 'bedroom'
    const zi = rt === 'bedroom' ? `bedroom-${i}` : rt
    return zi === zone.id
  })
  const myIdx = sharing.findIndex(r => r.id === resident.id)
  const SPREAD = [-0.15, 0.15, -0.3, 0.3, 0]
  const xOff = (SPREAD[Math.min(myIdx, 4)] || 0) * px.w

  return {
    x: px.x + px.w / 2 + xOff - 18,
    y: px.y + px.h / 2 - 34,
  }
}

// ─── Component ────────────────────────────────────────────────────
interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
  onResolve: (id: string) => Promise<void>
  onGoToBuild: () => void
}

export default function GameMap({ residence, residents, events, rooms, onResolve, onGoToBuild }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(340)
  const prevRooms = useRef<Record<string, string>>({})
  const [walking, setWalking] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState<string | null>(null)

  // Measure container width
  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Detect room changes → trigger walk animation
  useEffect(() => {
    const nowWalking = new Set<string>()
    residents.forEach(r => {
      const prev = prevRooms.current[r.id]
      const curr = r.current_room_type || 'bedroom'
      if (prev && prev !== curr) nowWalking.add(r.id)
      prevRooms.current[r.id] = curr
    })
    if (nowWalking.size > 0) {
      setWalking(nowWalking)
      const t = setTimeout(() => setWalking(new Set()), 1400)
      return () => clearTimeout(t)
    }
  }, [residents])

  const zones = buildZones(rooms)
  const bedroomRows = Math.max(1, Math.ceil(rooms.filter(r => r.type === 'bedroom').length / 2))
  const otherRooms = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  const gardenCount = otherRooms.includes('garden') ? 1 : 0
  const otherRows = Math.ceil((otherRooms.filter(t => t !== 'garden').length) / 2) + gardenCount
  const totalH = bedroomRows * ROOM_H + CORRIDOR_H + otherRows * ROOM_H + 8

  const eventsByResident: Record<string, GameEvent[]> = {}
  events.forEach(e => { if (!eventsByResident[e.resident_id]) eventsByResident[e.resident_id] = []; eventsByResident[e.resident_id].push(e) })

  async function handleResolve(eventId: string) {
    setResolving(eventId)
    await onResolve(eventId)
    setResolving(null)
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StatsBar residence={residence} events={events} residents={residents} />
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="text-amber-400 font-semibold">La residencia está vacía.</p>
          <button onClick={onGoToBuild} className="btn-primary mt-4 text-sm">Ir a Obras</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <StatsBar residence={residence} events={events} residents={residents} />

      {/* THE MAP */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-amber-900/40"
        style={{ height: `${totalH}px`, background: '#08080f' }}
      >
        {/* Grid floor lines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Room zones */}
        {zones.filter(z => z.type !== 'empty').map(zone => {
          const px = getZonePixels(zone, bedroomRows, containerW)
          const zoneResidentEvents = events.filter(e =>
            residents.some((r, i) => {
              const ri = r.current_room_type || 'bedroom'
              const zi = ri === 'bedroom' ? `bedroom-${i}` : ri
              return e.resident_id === r.id && zi === zone.id
            })
          )
          const hasCritical = zoneResidentEvents.some(e => e.urgency === 'critical')

          return (
            <div
              key={zone.id}
              className="absolute transition-all duration-300"
              style={{
                left: px.x + 2, top: px.y + 2,
                width: px.w - 4, height: px.h - 4,
                background: zone.cfg.bg,
                border: `1px solid ${zone.cfg.border}`,
                borderRadius: 12,
                boxShadow: hasCritical ? `0 0 12px 2px rgba(239,68,68,0.4)` : `inset 0 0 20px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Room label */}
              <div className="flex items-center gap-1 px-2 pt-1.5">
                <span className="text-sm">{zone.icon}</span>
                <span className="text-[11px] font-semibold" style={{ color: zone.cfg.text }}>{zone.label}</span>
              </div>

              {/* Event overlays — tappable */}
              {zoneResidentEvents.length > 0 && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-col gap-1">
                  {zoneResidentEvents.slice(0, 2).map(ev => {
                    const ovl = EVENT_OVERLAY[ev.type] || { emoji: '⚠️', color: 'rgba(100,100,100,0.7)' }
                    return (
                      <button
                        key={ev.id}
                        onClick={() => handleResolve(ev.id)}
                        disabled={resolving === ev.id}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-left active:scale-95 transition-transform"
                        style={{ background: ovl.color, border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <span className="text-sm">{ovl.emoji}</span>
                        <span className="text-white text-[9px] font-semibold truncate flex-1">
                          {ev.residents?.name} · {resolving === ev.id ? '...' : '👆 resolver'}
                        </span>
                        {ev.urgency === 'critical' && <span className="text-red-300 text-[9px] animate-pulse">!</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Corridor */}
        <div
          className="absolute flex items-center px-3 gap-2"
          style={{
            left: 2, top: bedroomRows * ROOM_H + 2,
            width: containerW - 4, height: CORRIDOR_H - 4,
            background: '#0f0f18',
            borderTop: '1px solid #1e1e30',
            borderBottom: '1px solid #1e1e30',
          }}
        >
          <span className="text-[10px] text-amber-900 font-medium">— PASILLO —</span>
        </div>

        {/* Resident sprites */}
        {residents.map((resident, resIdx) => {
          const pos = getResidentPixels(resident, residents, zones, bedroomRows, containerW)
          const isWalking = walking.has(resident.id)
          const resEvents = eventsByResident[resident.id] || []
          const hasEvent = resEvents.length > 0
          const emoji = PERSONALITY_EMOJI[resident.personality] || '🧓'
          const happColor = resident.happiness >= 70 ? '#22c55e' : resident.happiness >= 40 ? '#f59e0b' : resident.happiness >= 20 ? '#f97316' : '#ef4444'

          return (
            <div
              key={resident.id}
              className="absolute flex flex-col items-center pointer-events-none"
              style={{
                left: pos.x,
                top: pos.y,
                width: 36,
                transition: 'left 1.1s cubic-bezier(0.4,0,0.2,1), top 1.1s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 10,
              }}
            >
              {/* Event bubble */}
              {hasEvent && (
                <div className="text-[11px] mb-0.5 animate-bounce">
                  {EVENT_OVERLAY[resEvents[0].type]?.emoji || '⚠️'}
                </div>
              )}

              {/* Avatar */}
              <div
                className={isWalking ? 'animate-walk' : 'animate-idle'}
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                {isWalking ? '🚶' : emoji}
              </div>

              {/* Happiness ring */}
              <div className="w-5 h-1 rounded-full mt-0.5" style={{ background: happColor, opacity: 0.8 }} />

              {/* Name + activity */}
              <p className="text-[9px] text-amber-400 font-semibold text-center leading-tight mt-0.5 whitespace-nowrap">
                {resident.name.split(' ')[0]}
              </p>
              {!isWalking && resident.activity && (
                <p className="text-[8px] text-amber-700 text-center leading-tight whitespace-nowrap max-w-[60px] truncate">
                  {resident.activity}
                </p>
              )}
            </div>
          )
        })}

        {/* Build more button */}
        <button
          onClick={onGoToBuild}
          className="absolute bottom-2 right-2 bg-amber-900/40 border border-amber-800/50 rounded-xl px-3 py-1.5 text-amber-600 text-[11px] hover:text-amber-400 transition-colors z-20"
        >
          🔨 + sala
        </button>
      </div>
    </div>
  )
}

function StatsBar({ residence, events, residents }: { residence: Residence; events: GameEvent[]; residents: Resident[] }) {
  const critical = events.filter(e => e.urgency === 'critical').length
  const avgHappy = residents.length ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length) : 0
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { label: 'Fondos', value: `${(residence.money / 1000).toFixed(1)}k€`, color: 'text-green-400', icon: '💰' },
        { label: 'Nivel JR', value: `${residence.level}`, color: 'text-amber-300', icon: '⭐' },
        { label: 'Ánimo', value: `${avgHappy}%`, color: avgHappy >= 60 ? 'text-green-400' : 'text-orange-400', icon: avgHappy >= 60 ? '😊' : '😟' },
        { label: 'Urgencias', value: events.length === 0 ? '😌' : critical > 0 ? `🚨${critical}` : `⚠️${events.length}`, color: events.length === 0 ? 'text-green-400' : critical > 0 ? 'text-red-400' : 'text-orange-400', icon: '' },
      ].map(s => (
        <div key={s.label} className="card py-2 text-center">
          <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
          <p className="text-amber-800 text-[10px]">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
