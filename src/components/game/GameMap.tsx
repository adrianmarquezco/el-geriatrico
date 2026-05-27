'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Resident, GameEvent, Room, Residence } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────
const ROOM_H = 116
const CORRIDOR_H = 26

const ROOM_CFG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
  bedroom:       { icon: '🛏️', label: 'Hab.',        bg: '#0c1629', border: '#1e40af', text: '#93c5fd' },
  tv_room:       { icon: '📺', label: 'Sala TV',      bg: '#130a25', border: '#7c3aed', text: '#c4b5fd' },
  dining_room:   { icon: '🍽️', label: 'Comedor',      bg: '#180a00', border: '#b45309', text: '#fcd34d' },
  garden:        { icon: '🌿', label: 'Jardín',       bg: '#041a0c', border: '#15803d', text: '#86efac' },
  infirmary:     { icon: '🏥', label: 'Enfermería',   bg: '#1a0808', border: '#dc2626', text: '#fca5a5' },
  chapel:        { icon: '⛪', label: 'Capilla',      bg: '#1a1200', border: '#d97706', text: '#fde68a' },
  barbershop:    { icon: '💈', label: 'Peluquería',   bg: '#1a0a12', border: '#db2777', text: '#f9a8d4' },
  cards_room:    { icon: '🃏', label: 'Sala cartas',  bg: '#080f1e', border: '#2563eb', text: '#93c5fd' },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia', bg: '#041616', border: '#0d9488', text: '#5eead4' },
}

const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}

const SPEECH: Record<string, string[]> = {
  quejica:    ['¡Este arroz está seco como el desierto!', 'Llevo esperando media hora', 'En mis tiempos esto no pasaba', '¿Pero es que nadie trabaja aquí?', 'La calefacción, otra vez mal'],
  cotilla:    ['¿Viste lo que hizo Don Paco?', 'Entre tú y yo...', 'Eso que te cuento, pero callao', 'Yo ya lo sabía...', 'Me ha llegado que...'],
  mandón:     ['Aquí mando yo', 'JR, venga, que no tenemos todo el día', 'En el banco teníamos otro nivel', 'Eso lo haría yo diferente'],
  devota:     ['Ave María Purísima', 'Hoy no olvides el rosario', 'Señor, dame paciencia', '¡Hay que ir a misa!'],
  sordo:      ['¿Cómo dices?', '¡Muy bien, gracias!', '¿Eh?', 'No te oigo bien', '¡Claro que sí!'],
  coqueta:    ['¿Te has fijado en el nuevo?', 'La vida son cuatro días, cariño', 'Hay que cuidarse', 'Yo a tu edad era un peligro'],
  misterioso: ['...', 'Sigo aquí', 'Ya pasará', 'No preguntes'],
  exigente:   ['Esto no está como lo hacía yo', 'Le falta sal', 'La presentación deja mucho que desear', 'En mi comedor escolar, nunca'],
  normal:     ['Buenas tardes', '¿A qué hora es la cena?', 'Qué frío hace', 'Hay que ver...'],
}

const SPEECH_EVENT: Record<string, string[]> = {
  hunger:        ['Me muero de hambre...', '¿Cuándo es la cena?', 'Llevo horas sin comer'],
  medication:    ['Esas pastillas no me sientan', '¿Para qué sirven estas?', 'Yo no me las tomo'],
  tv_dispute:    ['¡El fútbol es lo primero!', '¡Cambia eso!', '¡El mando es mío!'],
  fallen:        ['Ay, mi cadera...', '¡Llama al médico!', 'No es nada, no es nada'],
  missing:       ['Voy a dar un paseo', 'Aquí hace buen tiempo', 'Solo salgo un momento'],
  hygiene:       ['No hay quien aguante aquí...', '¿Dónde está la ducha?'],
  companionship: ['¿Hay alguien ahí?', 'Qué solo estoy...', 'Venid a verme'],
  locked_in:     ['¡No entro!', '¡Dejadme en paz!', 'Me quedo aquí dentro'],
}

const EVENT_OVERLAY: Record<string, { emoji: string; color: string }> = {
  hygiene:       { emoji: '💧', color: 'rgba(37,99,235,0.75)'   },
  fallen:        { emoji: '🩹', color: 'rgba(220,38,38,0.75)'   },
  tv_dispute:    { emoji: '📺💥', color: 'rgba(124,58,237,0.75)' },
  missing:       { emoji: '❓',  color: 'rgba(217,119,6,0.75)'  },
  hunger:        { emoji: '🍽️',  color: 'rgba(180,83,9,0.75)'   },
  medication:    { emoji: '💊',  color: 'rgba(219,39,119,0.75)' },
  companionship: { emoji: '💔',  color: 'rgba(225,29,72,0.75)'  },
  entertainment: { emoji: '😴',  color: 'rgba(71,85,105,0.75)'  },
  locked_in:     { emoji: '🔒',  color: 'rgba(100,116,139,0.75)' },
}

// ─── Layout engine ─────────────────────────────────────────────────
interface Zone { id: string; type: string; label: string; icon: string; col: number; row: number; isOther: boolean; cfg: typeof ROOM_CFG[string] }

function buildZones(rooms: Room[]): Zone[] {
  const bedrooms = rooms.filter(r => r.type === 'bedroom')
  const rawOthers = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  const others = [...rawOthers.filter(t => t !== 'garden'), ...rawOthers.filter(t => t === 'garden')]

  const zones: Zone[] = []
  bedrooms.forEach((_, i) => zones.push({
    id: `bedroom-${i}`, type: 'bedroom',
    label: bedrooms.length > 1 ? `Hab. ${i + 1}` : 'Habitación',
    icon: '🛏️', col: i % 2, row: Math.floor(i / 2), isOther: false, cfg: ROOM_CFG.bedroom,
  }))
  if (bedrooms.length % 2 !== 0 && bedrooms.length > 0) {
    zones.push({ id: 'slot-empty', type: 'empty', label: '', icon: '', col: 1, row: Math.floor(bedrooms.length / 2), isOther: false, cfg: { icon: '', label: '', bg: '#090912', border: '#1a1a2e', text: '#333' } })
  }
  let col = 0, row = 0
  others.forEach(type => {
    const full = type === 'garden'
    if (full && col !== 0) { col = 0; row++ }
    zones.push({ id: type, type, label: ROOM_CFG[type]?.label || type, icon: ROOM_CFG[type]?.icon || '🏠', col: full ? 2 : col, row, isOther: true, cfg: ROOM_CFG[type] || ROOM_CFG.bedroom })
    if (full) { row++; col = 0 } else { col++; if (col >= 2) { col = 0; row++ } }
  })
  return zones
}

function zonePx(zone: Zone, bedroomRows: number, cW: number): { x: number; y: number; w: number; h: number } {
  const colW = cW / 2
  const y = zone.isOther ? bedroomRows * ROOM_H + CORRIDOR_H + zone.row * ROOM_H : zone.row * ROOM_H
  const x = zone.col === 2 ? 0 : zone.col * colW
  const w = zone.col === 2 ? cW : colW
  return { x, y, w, h: ROOM_H }
}

// ─── Haptics ──────────────────────────────────────────────────────
function haptic(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// ─── Component ────────────────────────────────────────────────────
interface Props {
  residence: Residence; residents: Resident[]; events: GameEvent[]
  rooms: Room[]; onResolve: (id: string) => Promise<void>; onGoToBuild: () => void
}

export default function GameMap({ residence, residents, events, rooms, onResolve, onGoToBuild }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(340)
  const prevRoomRef = useRef<Record<string, string>>({})
  const [walking, setWalking] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<Record<string, string>>({})

  // Measure container
  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Detect room changes → walk animation
  useEffect(() => {
    const nowWalking = new Set<string>()
    residents.forEach(r => {
      const prev = prevRoomRef.current[r.id]
      const curr = r.current_room_type || 'bedroom'
      if (prev && prev !== curr) nowWalking.add(r.id)
      prevRoomRef.current[r.id] = curr
    })
    if (nowWalking.size > 0) {
      setWalking(nowWalking)
      const t = setTimeout(() => setWalking(new Set()), 1400)
      return () => clearTimeout(t)
    }
  }, [residents])

  // Speech bubbles: random every 10-20s
  useEffect(() => {
    if (residents.length === 0) return
    const schedule = () => {
      const delay = 10000 + Math.random() * 10000
      return setTimeout(() => {
        const r = residents[Math.floor(Math.random() * residents.length)]
        if (!r) return schedule()
        // Check if resident has an event → event speech
        const resEvents = events.filter(e => e.resident_id === r.id)
        let lines = resEvents.length > 0
          ? (SPEECH_EVENT[resEvents[0].type] || SPEECH[r.personality] || SPEECH.normal)
          : (SPEECH[r.personality] || SPEECH.normal)
        const text = lines[Math.floor(Math.random() * lines.length)]
        setBubbles(prev => ({ ...prev, [r.id]: text }))
        setTimeout(() => setBubbles(prev => { const next = { ...prev }; delete next[r.id]; return next }), 3500)
        schedule()
      }, delay)
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [residents, events])

  const zones = useMemo(() => buildZones(rooms), [rooms])
  const bedroomRows = Math.max(1, Math.ceil(rooms.filter(r => r.type === 'bedroom').length / 2))
  const otherTypes = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  const gardenRows = otherTypes.includes('garden') ? 1 : 0
  const otherRows = Math.ceil(otherTypes.filter(t => t !== 'garden').length / 2) + gardenRows
  const totalH = bedroomRows * ROOM_H + CORRIDOR_H + otherRows * ROOM_H + 8

  // ── ROBUST zone assignment ────────────────────────────────────────
  const { residentZone, zoneResidents } = useMemo(() => {
    const residentZone: Record<string, Zone> = {}
    const zoneResidents: Record<string, string[]> = {}
    const bedroomZones = zones.filter(z => z.type === 'bedroom')
    let bIdx = 0
    residents.forEach(r => {
      const roomType = r.current_room_type || 'bedroom'
      let zone: Zone | undefined
      if (roomType === 'bedroom') {
        zone = bedroomZones[bIdx % Math.max(bedroomZones.length, 1)]
        bIdx++
      } else {
        zone = zones.find(z => z.id === roomType)
        if (!zone) { zone = bedroomZones[bIdx % Math.max(bedroomZones.length, 1)]; bIdx++ }
      }
      if (!zone) return
      residentZone[r.id] = zone
      if (!zoneResidents[zone.id]) zoneResidents[zone.id] = []
      zoneResidents[zone.id].push(r.id)
    })
    return { residentZone, zoneResidents }
  }, [residents, zones])

  // Events grouped by zone (via resident assignment)
  const eventsByZone = useMemo(() => {
    const map: Record<string, GameEvent[]> = {}
    events.forEach(e => {
      const zone = residentZone[e.resident_id]
      if (!zone) return
      if (!map[zone.id]) map[zone.id] = []
      map[zone.id].push(e)
    })
    return map
  }, [events, residentZone])

  async function handleResolve(eventId: string, isCritical: boolean) {
    setResolving(eventId)
    haptic(isCritical ? [80, 40, 80, 40, 120] : [50, 30, 80])
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

      <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden border border-amber-900/40" style={{ height: `${totalH}px`, background: '#08080f' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '22px 22px' }} />

        {/* Room zones */}
        {zones.filter(z => z.type !== 'empty' && z.type !== 'corridor').map(zone => {
          const px = zonePx(zone, bedroomRows, containerW)
          const zoneEvs = eventsByZone[zone.id] || []
          const hasCritical = zoneEvs.some(e => e.urgency === 'critical')
          return (
            <div key={zone.id} className="absolute transition-all duration-300" style={{
              left: px.x + 2, top: px.y + 2, width: px.w - 4, height: px.h - 4,
              background: zone.cfg.bg, border: `1px solid ${zone.cfg.border}`, borderRadius: 10,
              boxShadow: hasCritical ? `0 0 14px 3px rgba(239,68,68,0.35)` : `inset 0 0 24px rgba(0,0,0,0.5)`,
            }}>
              <div className="flex items-center gap-1 px-2 pt-1.5">
                <span className="text-xs">{zone.icon}</span>
                <span className="text-[11px] font-semibold truncate" style={{ color: zone.cfg.text }}>{zone.label}</span>
              </div>
              {/* Event overlays */}
              {zoneEvs.length > 0 && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-col gap-1">
                  {zoneEvs.slice(0, 2).map(ev => {
                    const ovl = EVENT_OVERLAY[ev.type] || { emoji: '⚠️', color: 'rgba(100,100,100,0.75)' }
                    return (
                      <button key={ev.id} onClick={() => handleResolve(ev.id, ev.urgency === 'critical')} disabled={resolving === ev.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-left active:scale-95 transition-transform disabled:opacity-50"
                        style={{ background: ovl.color, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className={`text-xs ${ev.urgency === 'critical' ? 'animate-pulse' : 'animate-event'}`}>{ovl.emoji}</span>
                        <span className="text-white text-[9px] font-semibold truncate flex-1">
                          {ev.residents?.name} · {resolving === ev.id ? '...' : '👆 resolver'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Corridor */}
        <div className="absolute flex items-center px-3" style={{
          left: 2, top: bedroomRows * ROOM_H + 1, width: containerW - 4, height: CORRIDOR_H - 2,
          background: '#0d0d18', borderTop: '1px dashed #1e1e35', borderBottom: '1px dashed #1e1e35',
        }}>
          <span className="text-[10px] text-amber-900/70 tracking-widest uppercase">— pasillo —</span>
        </div>

        {/* Resident sprites */}
        {residents.map(resident => {
          const zone = residentZone[resident.id]
          if (!zone) return null
          const px = zonePx(zone, bedroomRows, containerW)
          const ids = zoneResidents[zone.id] || []
          const idx = ids.indexOf(resident.id)
          const count = ids.length
          const XPOS = count === 1 ? [0.5] : count === 2 ? [0.3, 0.7] : count === 3 ? [0.22, 0.5, 0.78] : [0.18, 0.38, 0.62, 0.82]
          const xFrac = XPOS[Math.min(idx, XPOS.length - 1)]
          const x = px.x + px.w * xFrac - 16
          const y = px.y + 20
          const isWalking = walking.has(resident.id)
          const hasEvent = events.some(e => e.resident_id === resident.id)
          const bubble = bubbles[resident.id]
          const happColor = resident.happiness >= 70 ? '#22c55e' : resident.happiness >= 40 ? '#f59e0b' : resident.happiness >= 20 ? '#f97316' : '#ef4444'

          return (
            <div key={resident.id} className="absolute pointer-events-none" style={{
              left: x, top: y, width: 32,
              transition: 'left 1.1s cubic-bezier(0.4,0,0.2,1), top 1.1s cubic-bezier(0.4,0,0.2,1)',
              zIndex: 10,
            }}>
              {/* Speech bubble */}
              {bubble && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
                  style={{ whiteSpace: 'normal', background: 'rgba(255,255,255,0.95)', color: '#1a1a2e', fontSize: 9, fontWeight: 600, padding: '3px 6px', borderRadius: 8, maxWidth: 110, lineHeight: 1.3, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                  {bubble}
                  <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(255,255,255,0.95)' }} />
                </div>
              )}

              {/* Event indicator */}
              {hasEvent && <div className="absolute -top-1 -right-1 text-[10px] animate-bounce z-20">🔴</div>}

              {/* Avatar */}
              <div className={`text-2xl text-center leading-none ${isWalking ? 'animate-walk' : 'animate-idle'}`} style={{ filter: `drop-shadow(0 0 4px ${happColor}40)` }}>
                {isWalking ? '🚶' : (PERSONALITY_EMOJI[resident.personality] || '🧓')}
              </div>

              {/* Happiness bar */}
              <div className="w-6 h-1 rounded-full mx-auto mt-0.5" style={{ background: '#1a1a2e' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${resident.happiness}%`, background: happColor }} />
              </div>

              {/* Name */}
              <p className="text-[8px] text-amber-400/80 text-center font-semibold mt-0.5 leading-none">
                {resident.name.split(' ')[0]}
              </p>
            </div>
          )
        })}

        {/* Build button */}
        <button onClick={onGoToBuild} className="absolute bottom-2 right-2 bg-amber-950/80 border border-amber-800/50 rounded-xl px-2.5 py-1 text-amber-600 text-[10px] hover:text-amber-400 transition-colors z-20">
          🔨 +sala
        </button>
      </div>
    </div>
  )
}

function StatsBar({ residence, events, residents }: { residence: Residence; events: GameEvent[]; residents: Resident[] }) {
  const critical = events.filter(e => e.urgency === 'critical').length
  const avg = residents.length ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length) : 0
  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { v: `${(residence.money / 1000).toFixed(1)}k€`, l: 'Fondos',    c: 'text-green-400'  },
        { v: `Nv.${residence.level}`,                     l: 'JR',        c: 'text-amber-300'  },
        { v: `${avg}%`,                                   l: 'Ánimo',     c: avg >= 60 ? 'text-green-400' : 'text-orange-400' },
        { v: events.length === 0 ? '😌' : critical > 0 ? `🚨${critical}` : `⚠️${events.length}`, l: 'Urgencias', c: events.length === 0 ? 'text-green-400' : critical > 0 ? 'text-red-400 animate-pulse' : 'text-orange-400' },
      ].map(s => (
        <div key={s.l} className="card py-2 text-center">
          <p className={`font-bold text-sm ${s.c}`}>{s.v}</p>
          <p className="text-amber-800 text-[10px]">{s.l}</p>
        </div>
      ))}
    </div>
  )
}
