'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Resident, GameEvent, Room, Residence } from '@/lib/types'

const ROOM_H = 110
const CORRIDOR_H = 26

const ROOM_CFG: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
  bedroom:       { icon: '🛏️', label: 'Hab.',        bg: '#0a1220', border: '#1e40af', text: '#93c5fd' },
  tv_room:       { icon: '📺', label: 'Sala TV',      bg: '#100820', border: '#7c3aed', text: '#c4b5fd' },
  dining_room:   { icon: '🍽️', label: 'Comedor',      bg: '#150800', border: '#b45309', text: '#fcd34d' },
  garden:        { icon: '🌿', label: 'Jardín',       bg: '#031408', border: '#15803d', text: '#86efac' },
  infirmary:     { icon: '🏥', label: 'Enfermería',   bg: '#160606', border: '#dc2626', text: '#fca5a5' },
  chapel:        { icon: '⛪', label: 'Capilla',      bg: '#150e00', border: '#d97706', text: '#fde68a' },
  barbershop:    { icon: '💈', label: 'Peluquería',   bg: '#15080e', border: '#db2777', text: '#f9a8d4' },
  cards_room:    { icon: '🃏', label: 'Sala cartas',  bg: '#060d18', border: '#2563eb', text: '#93c5fd' },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia', bg: '#031212', border: '#0d9488', text: '#5eead4' },
}

const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}

const SPEECH: Record<string, string[]> = {
  quejica:    ['¡Este arroz está seco!', 'Llevo esperando media hora', 'En mis tiempos esto no pasaba', '¿Pero es que nadie trabaja aquí?'],
  cotilla:    ['¿Viste lo que hizo Don Paco?', 'Entre tú y yo...', 'Eso que te cuento, pero callao', 'Ya lo sabía...'],
  mandón:     ['Aquí mando yo', 'JR, que no tenemos todo el día', 'Eso lo haría yo diferente'],
  devota:     ['Ave María Purísima', 'Hoy no olvides el rosario', '¡Hay que ir a misa!'],
  sordo:      ['¿Cómo dices?', '¡Muy bien, gracias!', '¿Eh?', '¡Claro que sí!'],
  coqueta:    ['¿Te has fijado en el nuevo?', 'Hay que cuidarse', 'Yo a tu edad era un peligro'],
  misterioso: ['...', 'Sigo aquí', 'Ya pasará'],
  exigente:   ['Esto no está como lo hacía yo', 'Le falta sal', 'Nunca en mi comedor escolar'],
  normal:     ['Buenas tardes', '¿A qué hora es la cena?', 'Qué frío hace'],
}

const SPEECH_EVENT: Record<string, string[]> = {
  hunger:        ['Me muero de hambre...', '¿Cuándo es la cena?'],
  medication:    ['Esas pastillas no me sientan', 'Yo no me las tomo'],
  tv_dispute:    ['¡El fútbol es lo primero!', '¡El mando es mío!'],
  fallen:        ['Ay, mi cadera...', '¡Llama al médico!'],
  missing:       ['Voy a dar un paseo', 'Solo salgo un momento'],
  hygiene:       ['¿Dónde está la ducha?'],
  companionship: ['¿Hay alguien ahí?', 'Qué solo estoy...'],
  family_visit:  ['¡Que vienen mis hijos!', 'Por fin una visita'],
  inspection:    ['¿Quién es ese señor?', 'Venía con una carpeta...'],
}

const EVENT_OVERLAY: Record<string, { emoji: string; color: string }> = {
  hygiene:       { emoji: '💧',   color: 'rgba(37,99,235,0.8)'    },
  fallen:        { emoji: '🩹',   color: 'rgba(220,38,38,0.8)'    },
  tv_dispute:    { emoji: '📺💥', color: 'rgba(124,58,237,0.8)'   },
  missing:       { emoji: '❓',   color: 'rgba(217,119,6,0.8)'    },
  hunger:        { emoji: '🍽️',  color: 'rgba(180,83,9,0.8)'     },
  medication:    { emoji: '💊',   color: 'rgba(219,39,119,0.8)'   },
  companionship: { emoji: '💔',   color: 'rgba(225,29,72,0.8)'    },
  entertainment: { emoji: '😴',   color: 'rgba(71,85,105,0.8)'    },
  locked_in:     { emoji: '🔒',   color: 'rgba(100,116,139,0.8)'  },
  family_visit:  { emoji: '👨‍👩‍👧',  color: 'rgba(190,24,93,0.8)'   },
  inspection:    { emoji: '🔍',   color: 'rgba(37,99,235,0.8)'    },
}

function getDayTint(): { overlay: string; label: string } {
  const h = new Date().getHours()
  if (h >= 0  && h < 6)  return { overlay: 'rgba(10,5,30,0.55)',  label: '🌙 Madrugada' }
  if (h >= 6  && h < 9)  return { overlay: 'rgba(120,60,0,0.25)', label: '🌅 Amanecer' }
  if (h >= 9  && h < 14) return { overlay: 'rgba(0,0,0,0)',       label: '☀️ Mañana' }
  if (h >= 14 && h < 18) return { overlay: 'rgba(0,0,0,0)',       label: '🌤 Tarde' }
  if (h >= 18 && h < 21) return { overlay: 'rgba(80,30,0,0.30)',  label: '🌇 Atardecer' }
  return { overlay: 'rgba(10,5,40,0.45)', label: '🌃 Noche' }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  return { r: parseInt(m[1].slice(0,2),16), g: parseInt(m[1].slice(2,4),16), b: parseInt(m[1].slice(4,6),16) }
}

function darkenBorder(hex: string, factor = 0.35): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'rgba(0,0,0,0.6)'
  return `rgb(${Math.round(rgb.r*factor)},${Math.round(rgb.g*factor)},${Math.round(rgb.b*factor)})`
}

function alphaBorder(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(100,100,100,${alpha})`
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

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
    zones.push({ id: 'slot-empty', type: 'empty', label: '', icon: '', col: 1, row: Math.floor(bedrooms.length / 2), isOther: false, cfg: { icon: '', label: '', bg: '#07070f', border: '#12122a', text: '#222' } })
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

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
  onResolve: (id: string) => Promise<void>
  onGoToBuild: () => void
  onRepairRoom?: (roomId: string) => Promise<void>
  onOpenMiniGame?: (event: GameEvent, resident: Resident) => void
  onFamilyVisit?: (event: GameEvent, resident: Resident) => void
  onInspection?: (event: GameEvent) => void
}

export default function IsometricGameMap({
  residence, residents, events, rooms,
  onResolve, onGoToBuild, onRepairRoom, onOpenMiniGame, onFamilyVisit, onInspection
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(340)
  const prevRoomRef = useRef<Record<string, string>>({})
  const [walking, setWalking] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<Record<string, string>>({})
  const [jrTarget, setJrTarget] = useState<{ x: number; y: number } | null>(null)
  const [jrVisible, setJrVisible] = useState(false)
  const [dayTint, setDayTint] = useState<{ overlay: string; label: string }>({ overlay: 'rgba(0,0,0,0)', label: '🌤' })
  useEffect(() => { setDayTint(getDayTint()) }, [])

  useEffect(() => {
    const measure = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

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

  useEffect(() => {
    if (residents.length === 0) return
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 10000 + Math.random() * 12000
      return setTimeout(() => {
        const r = residents[Math.floor(Math.random() * residents.length)]
        if (!r) { schedule(); return }
        const resEvents = events.filter(e => e.resident_id === r.id)
        const lines = resEvents.length > 0
          ? (SPEECH_EVENT[resEvents[0].type] || SPEECH[r.personality] || SPEECH.normal)
          : (SPEECH[r.personality] || SPEECH.normal)
        const text = lines[Math.floor(Math.random() * lines.length)]
        setBubbles(prev => ({ ...prev, [r.id]: text }))
        setTimeout(() => setBubbles(prev => { const n = { ...prev }; delete n[r.id]; return n }), 3500)
        schedule()
      }, delay)
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [residents.length])

  const zones = useMemo(() => buildZones(rooms), [rooms])
  const bedroomRows = Math.max(1, Math.ceil(rooms.filter(r => r.type === 'bedroom').length / 2))
  const otherTypes = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  const gardenRows = otherTypes.includes('garden') ? 1 : 0
  const otherRows = Math.ceil(otherTypes.filter(t => t !== 'garden').length / 2) + gardenRows
  const totalH = bedroomRows * ROOM_H + CORRIDOR_H + otherRows * ROOM_H + 8

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

  function getResidentPx(residentId: string): { x: number; y: number } | null {
    const zone = residentZone[residentId]
    if (!zone) return null
    const px = zonePx(zone, bedroomRows, containerW)
    const ids = zoneResidents[zone.id] || []
    const idx = ids.indexOf(residentId)
    const count = ids.length
    const XPOS = count === 1 ? [0.5] : count === 2 ? [0.3, 0.7] : count === 3 ? [0.22, 0.5, 0.78] : [0.18, 0.38, 0.62, 0.82]
    const xFrac = XPOS[Math.min(idx, XPOS.length - 1)]
    return { x: px.x + px.w * xFrac - 16, y: px.y + 22 }
  }

  async function handleResolve(event: GameEvent) {
    const resident = residents.find(r => r.id === event.resident_id)

    if (event.type === 'inspection' && onInspection) {
      if (typeof navigator !== 'undefined') navigator.vibrate?.([60, 30, 60])
      onInspection(event)
      return
    }

    if (!resident) return

    const pos = getResidentPx(event.resident_id)
    if (pos) {
      setJrTarget(pos)
      setJrVisible(true)
      setTimeout(() => setJrVisible(false), 2000)
    }

    if (typeof navigator !== 'undefined') navigator.vibrate?.(event.urgency === 'critical' ? [80, 40, 80, 40, 120] : [50, 30, 80])

    if (event.type === 'family_visit' && onFamilyVisit) {
      onFamilyVisit(event, resident)
      return
    }

    const miniGameTypes = ['medication', 'fallen', 'hunger', 'tv_dispute']
    if (miniGameTypes.includes(event.type) && onOpenMiniGame) {
      onOpenMiniGame(event, resident)
      return
    }

    setResolving(event.id)
    await onResolve(event.id)
    setResolving(null)
  }

  const brokenRoom = rooms.find(r => r.broken)

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StatsBar residence={residence} events={events} residents={residents} dayLabel={dayTint.label} />
        <div className="card text-center py-10">
          <p className="text-5xl mb-3">🏗️</p>
          <p className="text-amber-400 font-semibold">La residencia está vacía.</p>
          <p className="text-amber-700 text-sm mt-1 mb-4">Construye tu primera habitación para empezar</p>
          <button onClick={onGoToBuild} className="btn-primary text-sm">Ir a Obras →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <StatsBar residence={residence} events={events} residents={residents} dayLabel={dayTint.label} />

      {brokenRoom && onRepairRoom && (
        <div className="card border-red-700/60 bg-red-950/20 flex items-center gap-3">
          <span className="text-2xl">📺💥</span>
          <div className="flex-1">
            <p className="text-red-300 font-semibold text-sm">La tele está rota</p>
            <p className="text-red-700 text-xs">El entretenimiento se degrada el doble</p>
          </div>
          <button onClick={() => onRepairRoom(brokenRoom.id)}
            className="text-xs px-3 py-1.5 rounded-xl bg-red-800 text-red-200 font-bold active:scale-95 transition-transform shrink-0">
            150€ 🔧
          </button>
        </div>
      )}

      {residents.some(r => r.activity === 'hospitalizado — esperando traslado') && (
        <div className="card border-red-600/70 bg-red-950/30 animate-pulse">
          <p className="text-red-300 font-bold text-sm">🏥 Residente hospitalizado</p>
          <p className="text-red-700 text-xs">Una urgencia no atendida. −500€ y −10 reputación.</p>
        </div>
      )}

      {/* Isometric 3D Map */}
      <div
        className="w-full rounded-2xl overflow-hidden border border-amber-900/30"
        style={{ perspective: '1000px', perspectiveOrigin: '50% -30%' }}
      >
        <div
          ref={containerRef}
          className="relative w-full"
          style={{
            transform: 'rotateX(14deg) scale(1.03)',
            transformOrigin: '50% 0%',
            height: `${totalH}px`,
            background: 'linear-gradient(180deg, #060610 0%, #09090f 100%)',
          }}
        >
          {/* Isometric floor grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(rgba(200,180,100,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(200,180,100,0.8) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Room tiles */}
          {zones.filter(z => z.type !== 'empty').map(zone => {
            const px = zonePx(zone, bedroomRows, containerW)
            const zoneEvs = eventsByZone[zone.id] || []
            const hasCritical = zoneEvs.some(e => e.urgency === 'critical')
            const roomData = rooms.find(r => r.type === zone.type)
            const roomLevel = roomData?.level || 1
            const isBroken = roomData?.broken && zone.type === 'tv_room'
            const borderColor = isBroken ? '#dc2626' : zone.cfg.border
            const depth = darkenBorder(borderColor, 0.4)
            const DEPTH = 6

            return (
              <div key={zone.id} className="absolute transition-all duration-300" style={{
                left: px.x + 3,
                top: px.y + 3,
                width: px.w - 6,
                height: px.h - 6,
                background: zone.cfg.bg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px 10px 6px 6px',
                boxShadow: [
                  `0 ${DEPTH}px 0 ${depth}`,
                  `0 ${DEPTH + 3}px 12px rgba(0,0,0,0.6)`,
                  hasCritical ? `0 0 20px 5px rgba(239,68,68,0.35), inset 0 0 20px rgba(239,68,68,0.1)` : `inset 0 0 28px rgba(0,0,0,0.4)`,
                  isBroken ? `0 0 12px 3px rgba(220,38,38,0.25)` : '',
                ].filter(Boolean).join(', '),
              }}>
                {/* Top-face lighting gradient */}
                <div className="absolute inset-x-0 top-0 h-8 rounded-t-xl pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, ${alphaBorder(borderColor, 0.3)}, transparent)` }}
                />

                {/* Room header */}
                <div className="flex items-center gap-1 px-2 pt-1.5 relative z-10">
                  <span className="text-xs">{isBroken ? '📺💥' : zone.icon}</span>
                  <span className="text-[11px] font-bold truncate" style={{ color: zone.cfg.text }}>{zone.label}</span>
                  {roomData && roomData.level > 1 && (
                    <span className="text-[9px] ml-auto px-1 py-0.5 rounded font-bold" style={{ background: alphaBorder(borderColor, 0.2), color: zone.cfg.text }}>Nv.{roomData.level}</span>
                  )}
                  {zoneEvs.length > 0 && (
                    <span className={`${roomData && roomData.level > 1 ? '' : 'ml-auto'} text-[9px] font-bold px-1.5 py-0.5 rounded-full ${hasCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-700/80 text-orange-200'}`}>
                      {zoneEvs.length}
                    </span>
                  )}
                </div>

                {/* Event action buttons */}
                {zoneEvs.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
                    {zoneEvs.slice(0, 2).map(ev => {
                      const ovl = EVENT_OVERLAY[ev.type] || { emoji: '⚠️', color: 'rgba(100,100,100,0.8)' }
                      const ticksLeft = ev.unresolved_ticks > 0 ? Math.max(0, (ev.urgency === 'normal' ? 4 : 8) - ev.unresolved_ticks) : null
                      return (
                        <button key={ev.id}
                          onClick={() => handleResolve(ev)}
                          disabled={resolving === ev.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-left active:scale-95 transition-transform disabled:opacity-50"
                          style={{ background: ovl.color, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
                          <span className={`text-xs ${ev.urgency === 'critical' ? 'animate-pulse' : ''}`}>{ovl.emoji}</span>
                          <span className="text-white text-[9px] font-semibold truncate flex-1">
                            {ev.type === 'inspection' ? 'Inspector Ramírez' : (ev as GameEvent & { residents?: { name: string } }).residents?.name} · {resolving === ev.id ? '...' : '👆 Atender'}
                          </span>
                          {ticksLeft !== null && ticksLeft <= 2 && (
                            <span className="text-red-300 text-[8px] font-bold shrink-0 animate-pulse">⚡{ticksLeft}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Bottom depth face visual */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 rounded-b-lg pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent, ${alphaBorder(borderColor, 0.4)})` }}
                />
              </div>
            )
          })}

          {/* Corridor */}
          <div className="absolute flex items-center gap-2 px-3" style={{
            left: 2, top: bedroomRows * ROOM_H + 1, width: containerW - 4, height: CORRIDOR_H - 2,
            background: 'linear-gradient(90deg, #08081a 0%, #0d0d24 50%, #08081a 100%)',
            borderTop: '1px solid #1e1e3a', borderBottom: '1px solid #1e1e3a',
          }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent" />
            <span className="text-[9px] text-amber-900/50 tracking-[0.3em] uppercase shrink-0">pasillo</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent" />
          </div>

          {/* Resident sprites */}
          {residents.map(resident => {
            const pos = getResidentPx(resident.id)
            if (!pos) return null
            const isWalking = walking.has(resident.id)
            const hasEvent = events.some(e => e.resident_id === resident.id)
            const bubble = bubbles[resident.id]
            const happColor = resident.happiness >= 70 ? '#22c55e' : resident.happiness >= 40 ? '#f59e0b' : resident.happiness >= 20 ? '#f97316' : '#ef4444'
            const isHospitalized = resident.activity === 'hospitalizado — esperando traslado'

            return (
              <div key={resident.id} className="absolute pointer-events-none" style={{
                left: pos.x, top: pos.y, width: 32,
                transition: 'left 1.1s cubic-bezier(0.4,0,0.2,1), top 1.1s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 10,
              }}>
                {bubble && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
                    style={{ whiteSpace: 'normal', background: 'rgba(255,255,255,0.95)', color: '#1a1a2e', fontSize: 9, fontWeight: 600, padding: '3px 6px', borderRadius: 8, maxWidth: 110, lineHeight: 1.3, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                    {bubble}
                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(255,255,255,0.95)' }} />
                  </div>
                )}
                {hasEvent && <div className="absolute -top-1 -right-1 text-[10px] animate-bounce z-20">🔴</div>}
                {isHospitalized && <div className="absolute -top-1 -left-1 text-[10px] z-20">🏥</div>}
                <div className={`text-2xl text-center leading-none ${isHospitalized ? 'opacity-40' : isWalking ? 'animate-walk' : 'animate-idle'}`}
                  style={{ filter: `drop-shadow(0 2px 6px ${happColor}60)` }}>
                  {isHospitalized ? '🛌' : isWalking ? '🚶' : (PERSONALITY_EMOJI[resident.personality] || '🧓')}
                </div>
                <div className="w-6 h-1 rounded-full mx-auto mt-0.5" style={{ background: '#12122a' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${resident.happiness}%`, background: happColor }} />
                </div>
                <p className="text-[8px] text-amber-400/80 text-center font-semibold mt-0.5 leading-none">
                  {resident.name.split(' ')[0]}
                </p>
              </div>
            )
          })}

          {/* JR sprite */}
          {jrVisible && jrTarget && (
            <div className="absolute pointer-events-none z-20" style={{
              left: jrTarget.x - 4, top: jrTarget.y - 4, width: 32,
              transition: 'left 0.5s ease-out, top 0.5s ease-out',
            }}>
              <div className="text-2xl text-center animate-walk drop-shadow-lg">👨‍⚕️</div>
              <p className="text-[8px] text-green-400 text-center font-bold">JR</p>
            </div>
          )}

          {/* Day/night overlay */}
          {dayTint.overlay !== 'rgba(0,0,0,0)' && (
            <div className="absolute inset-0 pointer-events-none z-30 transition-all duration-[3000ms]"
              style={{ background: dayTint.overlay }} />
          )}

          {/* Build button */}
          <button onClick={onGoToBuild} className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-amber-950/90 border border-amber-700/50 rounded-xl px-2.5 py-1.5 text-amber-500 text-[10px] font-semibold hover:text-amber-300 transition-colors active:scale-95"
            style={{ backdropFilter: 'blur(8px)' }}>
            🔨 Nueva sala
          </button>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ residence, events, residents, dayLabel }: { residence: Residence; events: GameEvent[]; residents: Resident[]; dayLabel: string }) {
  const critical = events.filter(e => e.urgency === 'critical').length
  const avg = residents.length ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length) : 0
  const streak = residence.streak_days ?? 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: `${(residence.money / 1000).toFixed(1)}k€`, l: 'Fondos', c: 'text-green-400' },
          { v: `Nv.${residence.level}`, l: 'JR', c: 'text-amber-300' },
          { v: `${avg}%`, l: 'Ánimo', c: avg >= 60 ? 'text-green-400' : 'text-orange-400' },
          { v: events.length === 0 ? '😌' : critical > 0 ? `🚨${critical}` : `⚠️${events.length}`, l: 'Urgencias', c: events.length === 0 ? 'text-green-400' : critical > 0 ? 'text-red-400 animate-pulse' : 'text-orange-400' },
        ].map(s => (
          <div key={s.l} className="card py-2 text-center">
            <p className={`font-bold text-sm ${s.c}`}>{s.v}</p>
            <p className="text-amber-800 text-[10px]">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-amber-800 text-[10px]">{dayLabel}</p>
        {streak > 0 && (
          <p className={`text-[10px] font-bold ${streak >= 7 ? 'text-yellow-400' : streak >= 3 ? 'text-orange-400' : 'text-amber-600'}`}>
            🔥 {streak} {streak === 1 ? 'día' : 'días'} sin crisis
          </p>
        )}
      </div>
    </div>
  )
}
