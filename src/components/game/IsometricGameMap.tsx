'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Resident, GameEvent, Room, Residence } from '@/lib/types'

const ROOM_H = 108
const CORRIDOR_H = 24

const ROOM_CFG: Record<string, {
  icon: string; label: string;
  bg: string; border: string; text: string; glow: string
}> = {
  bedroom:       { icon: '🛏️', label: 'Hab.',        bg: 'linear-gradient(145deg,#0f2040,#080e20)', border: '#3b82f6', text: '#93c5fd', glow: 'rgba(59,130,246,0.4)'  },
  tv_room:       { icon: '📺', label: 'Sala TV',      bg: 'linear-gradient(145deg,#1e0a40,#100420)', border: '#a855f7', text: '#c4b5fd', glow: 'rgba(168,85,247,0.4)' },
  dining_room:   { icon: '🍽️', label: 'Comedor',      bg: 'linear-gradient(145deg,#301800,#180c00)', border: '#f59e0b', text: '#fcd34d', glow: 'rgba(245,158,11,0.4)' },
  garden:        { icon: '🌿', label: 'Jardín',       bg: 'linear-gradient(145deg,#0a2e10,#041408)', border: '#22c55e', text: '#86efac', glow: 'rgba(34,197,94,0.4)'  },
  infirmary:     { icon: '🏥', label: 'Enfermería',   bg: 'linear-gradient(145deg,#2e0808,#180404)', border: '#ef4444', text: '#fca5a5', glow: 'rgba(239,68,68,0.4)'  },
  chapel:        { icon: '⛪', label: 'Capilla',      bg: 'linear-gradient(145deg,#2a1e04,#160e00)', border: '#d97706', text: '#fde68a', glow: 'rgba(217,119,6,0.4)'  },
  barbershop:    { icon: '💈', label: 'Peluquería',   bg: 'linear-gradient(145deg,#300a1c,#180408)', border: '#ec4899', text: '#f9a8d4', glow: 'rgba(236,72,153,0.4)' },
  cards_room:    { icon: '🃏', label: 'Sala cartas',  bg: 'linear-gradient(145deg,#0c1a38,#060e1c)', border: '#2563eb', text: '#93c5fd', glow: 'rgba(37,99,235,0.4)'  },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia', bg: 'linear-gradient(145deg,#062422,#021210)', border: '#0d9488', text: '#5eead4', glow: 'rgba(13,148,136,0.4)' },
}

const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}

const SPEECH: Record<string, string[]> = {
  quejica:    ['¡Este arroz está seco!', 'Llevo esperando media hora', '¿Pero es que nadie trabaja aquí?'],
  cotilla:    ['¿Viste lo que hizo Don Paco?', 'Entre tú y yo...', 'Eso que te cuento, pero callao'],
  mandón:     ['Aquí mando yo', 'JR, que no tenemos todo el día'],
  devota:     ['Ave María Purísima', '¡Hay que ir a misa!'],
  sordo:      ['¿Cómo dices?', '¡Muy bien, gracias!', '¿Eh?'],
  coqueta:    ['Hay que cuidarse', 'Yo a tu edad era un peligro'],
  misterioso: ['...', 'Ya pasará'],
  exigente:   ['Esto no está como lo hacía yo', 'Le falta sal'],
  normal:     ['Buenas tardes', '¿A qué hora es la cena?'],
}

const SPEECH_EVENT: Record<string, string[]> = {
  hunger:        ['Me muero de hambre...', '¿Cuándo es la cena?'],
  medication:    ['Esas pastillas no me sientan'],
  tv_dispute:    ['¡El fútbol es lo primero!', '¡El mando es mío!'],
  fallen:        ['Ay, mi cadera...', '¡Llama al médico!'],
  hygiene:       ['¿Dónde está la ducha?'],
  companionship: ['Qué solo estoy...'],
  family_visit:  ['¡Que vienen mis hijos!'],
  inspection:    ['¿Quién es ese señor con carpeta?'],
}

const EVENT_OVERLAY: Record<string, { emoji: string; color: string }> = {
  hygiene:       { emoji: '💧',   color: 'rgba(37,99,235,0.85)'    },
  fallen:        { emoji: '🩹',   color: 'rgba(220,38,38,0.85)'    },
  tv_dispute:    { emoji: '📺💥', color: 'rgba(124,58,237,0.85)'   },
  missing:       { emoji: '❓',   color: 'rgba(217,119,6,0.85)'    },
  hunger:        { emoji: '🍽️',  color: 'rgba(234,88,12,0.85)'    },
  medication:    { emoji: '💊',   color: 'rgba(219,39,119,0.85)'   },
  companionship: { emoji: '💔',   color: 'rgba(225,29,72,0.85)'    },
  entertainment: { emoji: '😴',   color: 'rgba(71,85,105,0.85)'    },
  locked_in:     { emoji: '🔒',   color: 'rgba(100,116,139,0.85)'  },
  family_visit:  { emoji: '👨‍👩‍👧',  color: 'rgba(190,24,93,0.85)'   },
  inspection:    { emoji: '🔍',   color: 'rgba(37,99,235,0.85)'    },
}

function getDayTint(): { overlay: string; label: string } {
  const h = new Date().getHours()
  if (h >= 0  && h < 6)  return { overlay: 'rgba(8,4,24,0.58)',  label: '🌙 Madrugada' }
  if (h >= 6  && h < 9)  return { overlay: 'rgba(100,50,0,0.22)', label: '🌅 Amanecer' }
  if (h >= 9  && h < 14) return { overlay: 'rgba(0,0,0,0)',       label: '☀️ Mañana' }
  if (h >= 14 && h < 18) return { overlay: 'rgba(0,0,0,0)',       label: '🌤 Tarde' }
  if (h >= 18 && h < 21) return { overlay: 'rgba(60,20,0,0.28)',  label: '🌇 Atardecer' }
  return { overlay: 'rgba(8,4,32,0.48)', label: '🌃 Noche' }
}

interface Collectible {
  id: string
  residentId: string
  type: 'coin' | 'heart' | 'star'
  x: number
  y: number
  value: number
}

interface Zone {
  id: string; type: string; label: string; icon: string
  col: number; row: number; isOther: boolean
  cfg: typeof ROOM_CFG[string]
}

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
    zones.push({ id: 'slot-empty', type: 'empty', label: '', icon: '', col: 1, row: Math.floor(bedrooms.length / 2), isOther: false, cfg: { icon: '', label: '', bg: '#07080e', border: '#1a1a2e', text: '#222', glow: 'transparent' } })
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
  onCollect?: (value: number, type: 'money' | 'xp') => void
}

export default function IsometricGameMap({
  residence, residents, events, rooms,
  onResolve, onGoToBuild, onRepairRoom,
  onOpenMiniGame, onFamilyVisit, onInspection, onCollect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(340)
  const prevRoomRef = useRef<Record<string, string>>({})
  const [walking, setWalking] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<Record<string, string>>({})
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [collected, setCollected] = useState<{ id: string; text: string; x: number; y: number }[]>([])
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

  // Walking animation
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

  // Speech bubbles
  useEffect(() => {
    if (residents.length === 0) return
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 12000 + Math.random() * 10000
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

  // ★ Floating collectibles — main active mechanic
  const spawnCollectible = useCallback(() => {
    if (residents.length === 0) return
    const r = residents[Math.floor(Math.random() * residents.length)]
    const zone = residentZoneRef.current[r.id]
    if (!zone) return
    const px = zonePx(zone, bedroomRowsRef.current, containerW)
    const XPOS = [0.25, 0.5, 0.75]
    const xFrac = XPOS[Math.floor(Math.random() * 3)]
    const x = px.x + px.w * xFrac
    const y = px.y + 12
    const rand = Math.random()
    const type = rand < 0.55 ? 'coin' : rand < 0.82 ? 'heart' : 'star'
    const value = type === 'coin' ? 40 + Math.floor(Math.random() * 60) : type === 'heart' ? 5 : 3
    const id = Date.now().toString() + Math.random()
    const coll: Collectible = { id, residentId: r.id, type, x, y, value }
    setCollectibles(prev => [...prev, coll])
    // Auto-expire after 9 seconds
    setTimeout(() => setCollectibles(prev => prev.filter(c => c.id !== id)), 9000)
  }, [residents, containerW])

  const residentZoneRef = useRef<Record<string, Zone>>({})
  const bedroomRowsRef = useRef(1)

  const zones = useMemo(() => buildZones(rooms), [rooms])
  const bedroomRows = Math.max(1, Math.ceil(rooms.filter(r => r.type === 'bedroom').length / 2))
  bedroomRowsRef.current = bedroomRows
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

  residentZoneRef.current = residentZone

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

  // Spawn collectibles every 40-75 seconds
  useEffect(() => {
    if (residents.length === 0) return
    const interval = setInterval(spawnCollectible, 40000 + Math.random() * 35000)
    // Spawn one after 8 seconds on first load to show the mechanic
    const first = setTimeout(spawnCollectible, 8000)
    return () => { clearInterval(interval); clearTimeout(first) }
  }, [spawnCollectible])

  function handleCollect(coll: Collectible) {
    setCollectibles(prev => prev.filter(c => c.id !== coll.id))
    const label = coll.type === 'coin' ? `+${coll.value}€` : coll.type === 'heart' ? `+${coll.value} ánimo` : `+${coll.value} XP`
    setCollected(prev => [...prev, { id: coll.id, text: label, x: coll.x, y: coll.y }])
    setTimeout(() => setCollected(prev => prev.filter(c => c.id !== coll.id)), 1200)
    if (onCollect) {
      if (coll.type === 'coin') onCollect(coll.value, 'money')
      else if (coll.type === 'star') onCollect(coll.value, 'xp')
    }
    if (typeof navigator !== 'undefined') navigator.vibrate?.(40)
  }

  function getResidentPx(residentId: string): { x: number; y: number } | null {
    const zone = residentZone[residentId]
    if (!zone) return null
    const px = zonePx(zone, bedroomRows, containerW)
    const ids = zoneResidents[zone.id] || []
    const idx = ids.indexOf(residentId)
    const count = ids.length
    const XPOS = count === 1 ? [0.5] : count === 2 ? [0.3, 0.7] : count === 3 ? [0.22, 0.5, 0.78] : [0.18, 0.38, 0.62, 0.82]
    const xFrac = XPOS[Math.min(idx, XPOS.length - 1)]
    return { x: px.x + px.w * xFrac - 16, y: px.y + 24 }
  }

  async function handleResolve(event: GameEvent) {
    const resident = residents.find(r => r.id === event.resident_id)
    if (event.type === 'inspection' && onInspection) {
      navigator.vibrate?.([60, 30, 60])
      onInspection(event); return
    }
    if (!resident) return
    const pos = getResidentPx(event.resident_id)
    if (pos) { setJrTarget(pos); setJrVisible(true); setTimeout(() => setJrVisible(false), 2000) }
    navigator.vibrate?.(event.urgency === 'critical' ? [80, 40, 80, 40, 120] : [50, 30, 80])
    if (event.type === 'family_visit' && onFamilyVisit) { onFamilyVisit(event, resident); return }
    if (['medication', 'fallen', 'hunger', 'tv_dispute'].includes(event.type) && onOpenMiniGame) {
      onOpenMiniGame(event, resident); return
    }
    setResolving(event.id)
    await onResolve(event.id)
    setResolving(null)
  }

  const brokenRoom = rooms.find(r => r.broken)

  const COLL_EMOJI = { coin: '💰', heart: '💝', star: '⭐' }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StatsBar residence={residence} events={events} residents={residents} dayLabel={dayTint.label} />
        <div className="card text-center py-12">
          <p className="text-5xl mb-3">🏗️</p>
          <p className="text-slate-300 font-semibold text-base">La residencia está vacía</p>
          <p className="text-slate-600 text-sm mt-1 mb-5">Construye tu primera habitación para empezar</p>
          <button onClick={onGoToBuild} className="btn-primary text-sm px-6">Ir a Obras →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <StatsBar residence={residence} events={events} residents={residents} dayLabel={dayTint.label} />

      {brokenRoom && onRepairRoom && (
        <div className="card card-red flex items-center gap-3">
          <span className="text-2xl">📺💥</span>
          <div className="flex-1">
            <p className="text-red-300 font-bold text-sm">La tele está rota</p>
            <p className="text-red-600 text-xs">El entretenimiento se degrada el doble</p>
          </div>
          <button onClick={() => onRepairRoom(brokenRoom.id)}
            className="text-xs px-3 py-2 rounded-xl font-bold active:scale-95 transition-transform shrink-0"
            style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)' }}>
            150€ 🔧
          </button>
        </div>
      )}

      {residents.some(r => r.activity === 'hospitalizado — esperando traslado') && (
        <div className="card card-red animate-pulse">
          <p className="text-red-300 font-bold text-sm">🏥 Residente hospitalizado</p>
          <p className="text-red-600 text-xs mt-0.5">Urgencia no atendida. −500€ y −10 reputación.</p>
        </div>
      )}

      {/* 3D Isometric Map */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(255,255,255,0.07)',
          perspective: '1000px',
          perspectiveOrigin: '50% -20%',
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full"
          style={{
            transform: 'rotateX(13deg) scale(1.02)',
            transformOrigin: '50% 0%',
            height: `${totalH}px`,
            background: 'linear-gradient(180deg, #0a0c14 0%, #070810 60%, #06080d 100%)',
          }}
        >
          {/* Floor grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,130,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,130,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
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
            const cfg = zone.cfg
            const borderColor = isBroken ? '#ef4444' : cfg.border
            const glowColor = isBroken ? 'rgba(239,68,68,0.45)' : hasCritical ? 'rgba(239,68,68,0.55)' : cfg.glow
            const DEPTH = 7

            return (
              <div key={zone.id} className="absolute transition-all duration-300" style={{
                left: px.x + 3, top: px.y + 3,
                width: px.w - 6, height: px.h - 6,
                background: cfg.bg,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px 12px 6px 6px',
                boxShadow: [
                  `0 ${DEPTH}px 0 rgba(0,0,0,0.55)`,
                  `0 ${DEPTH + 4}px 16px rgba(0,0,0,0.5)`,
                  `0 0 0 1px rgba(255,255,255,0.04) inset`,
                  hasCritical ? `0 0 22px 6px rgba(239,68,68,0.4)` : `0 0 20px 2px ${glowColor}`,
                ].join(', '),
              }}>
                {/* Top-face lighting */}
                <div className="absolute inset-x-0 top-0 h-10 rounded-t-xl pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.07), transparent)` }}
                />

                {/* Room header */}
                <div className="flex items-center gap-1.5 px-2.5 pt-2 relative z-10">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `rgba(255,255,255,0.08)`, border: `1px solid rgba(255,255,255,0.1)` }}>
                    {isBroken ? '💥' : zone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight truncate" style={{ color: cfg.text }}>{zone.label}</p>
                    {roomLevel > 1 && (
                      <p className="text-[9px] font-semibold" style={{ color: `${cfg.border}99` }}>Nv.{roomLevel}</p>
                    )}
                  </div>
                  {zoneEvs.length > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                      hasCritical ? 'bg-red-500 text-white animate-pulse' : 'text-white'
                    }`}
                      style={!hasCritical ? { background: 'rgba(255,255,255,0.18)' } : undefined}>
                      {zoneEvs.length}⚠
                    </span>
                  )}
                </div>

                {/* Event action buttons */}
                {zoneEvs.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
                    {zoneEvs.slice(0, 2).map(ev => {
                      const ovl = EVENT_OVERLAY[ev.type] || { emoji: '⚠️', color: 'rgba(100,100,100,0.85)' }
                      const ticksLeft = ev.unresolved_ticks > 0 ? Math.max(0, (ev.urgency === 'normal' ? 4 : 8) - ev.unresolved_ticks) : null
                      return (
                        <button key={ev.id}
                          onClick={() => handleResolve(ev)}
                          disabled={resolving === ev.id}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                          style={{ background: ovl.color, border: '1px solid rgba(255,255,255,0.15)' }}>
                          <span className={`text-sm shrink-0 ${ev.urgency === 'critical' ? 'animate-event' : ''}`}>{ovl.emoji}</span>
                          <span className="text-white text-[9px] font-bold truncate flex-1">
                            {ev.type === 'inspection' ? 'Inspector Ramírez' : (ev as GameEvent & { residents?: { name: string } }).residents?.name}
                          </span>
                          <span className="text-white/70 text-[9px] shrink-0">
                            {resolving === ev.id ? '...' : '👆'}
                          </span>
                          {ticksLeft !== null && ticksLeft <= 2 && (
                            <span className="text-red-200 text-[8px] font-black shrink-0 animate-pulse ml-0.5">⚡{ticksLeft}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Bottom depth face */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 rounded-b-lg pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))` }}
                />
              </div>
            )
          })}

          {/* Corridor */}
          <div className="absolute flex items-center gap-2 px-4" style={{
            left: 2, top: bedroomRows * ROOM_H + 1, width: containerW - 4, height: CORRIDOR_H - 2,
            background: 'linear-gradient(90deg, #07080e 0%, #0c0e18 50%, #07080e 100%)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
            <span className="text-[9px] text-slate-700 tracking-[0.3em] uppercase shrink-0">pasillo</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
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
                left: pos.x, top: pos.y, width: 34,
                transition: 'left 1.1s cubic-bezier(0.4,0,0.2,1), top 1.1s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 10,
              }}>
                {bubble && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
                    style={{ whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.95)', color: '#0f172a', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 8, maxWidth: 120, lineHeight: 1.3, boxShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                    {bubble}
                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(255,255,255,0.95)' }} />
                  </div>
                )}
                {hasEvent && <div className="absolute -top-1.5 -right-1 text-[11px] animate-bounce z-20">🔴</div>}
                {isHospitalized && <div className="absolute -top-1.5 -left-1 text-[11px] z-20">🏥</div>}
                <div className={`text-[26px] text-center leading-none ${isHospitalized ? 'opacity-35' : isWalking ? 'animate-walk' : 'animate-idle'}`}
                  style={{ filter: `drop-shadow(0 2px 8px ${happColor}70)` }}>
                  {isHospitalized ? '🛌' : isWalking ? '🚶' : (PERSONALITY_EMOJI[resident.personality] || '🧓')}
                </div>
                <div className="w-6 h-1 rounded-full mx-auto mt-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${resident.happiness}%`, background: happColor }} />
                </div>
                <p className="text-[8px] text-slate-400 text-center font-semibold mt-0.5 leading-none">
                  {resident.name.split(' ')[0]}
                </p>
              </div>
            )
          })}

          {/* ★ Floating collectibles */}
          {collectibles.map(coll => (
            <button
              key={coll.id}
              onClick={() => handleCollect(coll)}
              className="absolute z-20 animate-collectible active:scale-125 transition-transform"
              style={{ left: coll.x - 18, top: coll.y - 20, width: 36, height: 36 }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: coll.type === 'coin' ? 'rgba(245,158,11,0.9)' : coll.type === 'heart' ? 'rgba(236,72,153,0.9)' : 'rgba(139,92,246,0.9)',
                  boxShadow: `0 0 16px 4px ${coll.type === 'coin' ? 'rgba(245,158,11,0.6)' : coll.type === 'heart' ? 'rgba(236,72,153,0.6)' : 'rgba(139,92,246,0.6)'}`,
                  border: '2px solid rgba(255,255,255,0.5)',
                }}>
                {COLL_EMOJI[coll.type]}
              </div>
            </button>
          ))}

          {/* Collect fly-up text */}
          {collected.map(c => (
            <div key={c.id} className="absolute z-30 pointer-events-none animate-collect-fly"
              style={{ left: c.x - 24, top: c.y - 10, width: 64, textAlign: 'center' }}>
              <span className="text-xs font-black text-white" style={{ textShadow: '0 0 8px rgba(245,158,11,0.8), 0 1px 3px rgba(0,0,0,0.8)' }}>
                {c.text}
              </span>
            </div>
          ))}

          {/* JR sprite */}
          {jrVisible && jrTarget && (
            <div className="absolute pointer-events-none z-20" style={{
              left: jrTarget.x - 4, top: jrTarget.y - 4, width: 32,
              transition: 'left 0.5s ease-out, top 0.5s ease-out',
            }}>
              <div className="text-[26px] text-center animate-walk drop-shadow-lg">👨‍⚕️</div>
              <p className="text-[8px] text-emerald-400 text-center font-black">JR</p>
            </div>
          )}

          {/* Day/night overlay */}
          {dayTint.overlay !== 'rgba(0,0,0,0)' && (
            <div className="absolute inset-0 pointer-events-none z-30 transition-all duration-[3000ms]"
              style={{ background: dayTint.overlay }} />
          )}

          {/* Build button */}
          <button onClick={onGoToBuild}
            className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold active:scale-95 transition-transform"
            style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24', backdropFilter: 'blur(8px)' }}>
            🔨 Sala nueva
          </button>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ residence, events, residents, dayLabel }: {
  residence: Residence; events: GameEvent[]; residents: Resident[]; dayLabel: string
}) {
  const critical = events.filter(e => e.urgency === 'critical').length
  const avg = residents.length ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length) : 0
  const streak = residence.streak_days ?? 0
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        <StatChip value={`${(residence.money / 1000).toFixed(1)}k€`} label="Fondos" color="#22c55e" />
        <StatChip value={`Nv.${residence.level}`} label="JR" color="#fbbf24" />
        <StatChip value={`${avg}%`} label="Ánimo" color={avg >= 60 ? '#22c55e' : avg >= 30 ? '#f97316' : '#ef4444'} />
        <StatChip
          value={events.length === 0 ? '😌' : critical > 0 ? `🚨${critical}` : `⚠️${events.length}`}
          label="Urgencias"
          color={events.length === 0 ? '#22c55e' : critical > 0 ? '#ef4444' : '#f97316'}
          pulse={critical > 0}
        />
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-600 text-[10px]">{dayLabel}</p>
        {streak > 0 && (
          <p className={`text-[10px] font-black ${streak >= 7 ? 'text-yellow-400' : streak >= 3 ? 'text-orange-400' : 'text-slate-500'}`}>
            🔥 {streak}d sin crisis
          </p>
        )}
      </div>
    </div>
  )
}

function StatChip({ value, label, color, pulse }: { value: string; label: string; color: string; pulse?: boolean }) {
  return (
    <div className="stat-chip">
      <p className={`font-black text-sm leading-tight ${pulse ? 'animate-pulse' : ''}`} style={{ color }}>{value}</p>
      <p className="text-slate-600 text-[10px] mt-0.5">{label}</p>
    </div>
  )
}
