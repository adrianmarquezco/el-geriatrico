'use client'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Resident, GameEvent, Room, Residence } from '@/lib/types'

const ROOM_H = 148
const CORRIDOR_H = 24

/* ─── Room visual config ─── */
const ROOM_CFG: Record<string, {
  icon: string; label: string
  bg: string; border: string; text: string; glow: string
}> = {
  bedroom:       { icon: '🛏️', label: 'Habitación',   bg: 'linear-gradient(150deg,#0d1e3e 0%,#07101e 100%)', border: '#3b82f6', text: '#93c5fd', glow: '59,130,246'  },
  tv_room:       { icon: '📺', label: 'Sala TV',       bg: 'linear-gradient(150deg,#1a0838 0%,#0c0420 100%)', border: '#a855f7', text: '#c4b5fd', glow: '168,85,247'  },
  dining_room:   { icon: '🍽️', label: 'Comedor',       bg: 'linear-gradient(150deg,#2c1600 0%,#160b00 100%)', border: '#f59e0b', text: '#fcd34d', glow: '245,158,11'  },
  garden:        { icon: '🌿', label: 'Jardín',        bg: 'linear-gradient(150deg,#092a0e 0%,#041008 100%)', border: '#22c55e', text: '#86efac', glow: '34,197,94'   },
  infirmary:     { icon: '🏥', label: 'Enfermería',    bg: 'linear-gradient(150deg,#2a0606 0%,#160303 100%)', border: '#ef4444', text: '#fca5a5', glow: '239,68,68'   },
  chapel:        { icon: '⛪', label: 'Capilla',       bg: 'linear-gradient(150deg,#261a00 0%,#130d00 100%)', border: '#d97706', text: '#fde68a', glow: '217,119,6'   },
  barbershop:    { icon: '💈', label: 'Peluquería',    bg: 'linear-gradient(150deg,#280810 0%,#140408 100%)', border: '#ec4899', text: '#f9a8d4', glow: '236,72,153'  },
  cards_room:    { icon: '🃏', label: 'Sala de cartas',bg: 'linear-gradient(150deg,#0a1630 0%,#060e1a 100%)', border: '#2563eb', text: '#93c5fd', glow: '37,99,235'   },
  physiotherapy: { icon: '🤸', label: 'Fisioterapia',  bg: 'linear-gradient(150deg,#062020 0%,#030e0e 100%)', border: '#0d9488', text: '#5eead4', glow: '13,148,136'  },
}

/* ─── Room ambient decorations ─── */
const ROOM_AMBIENT: Record<string, { emoji: string; x: number; y: number; cls: string; size?: string }[]> = {
  bedroom:       [
    { emoji: '💤', x: 72, y: 12, cls: 'anim-zzz', size: 'text-xs' },
    { emoji: '💤', x: 55, y: 20, cls: 'anim-zzz-delay', size: 'text-[9px]' },
  ],
  tv_room:       [
    { emoji: '📺', x: 45, y: 40, cls: 'anim-tv',   size: 'text-2xl' },
    { emoji: '🔵', x: 45, y: 40, cls: 'anim-tv',   size: 'text-2xl opacity-30' },
  ],
  dining_room:   [
    { emoji: '♨️', x: 40, y: 35, cls: 'anim-steam',       size: 'text-sm' },
    { emoji: '♨️', x: 58, y: 28, cls: 'anim-steam-delay', size: 'text-xs' },
  ],
  garden:        [
    { emoji: '🌸', x: 20, y: 55, cls: 'anim-sway',       size: 'text-lg' },
    { emoji: '🌿', x: 45, y: 58, cls: 'anim-sway-slow',   size: 'text-base' },
    { emoji: '🌺', x: 72, y: 52, cls: 'anim-sway-delay',  size: 'text-lg' },
    { emoji: '☀️', x: 80, y: 12, cls: 'anim-breathe',     size: 'text-sm' },
  ],
  infirmary:     [
    { emoji: '❤️', x: 70, y: 15, cls: 'anim-heartbeat', size: 'text-sm' },
    { emoji: '➕', x: 50, y: 38, cls: 'anim-breathe',   size: 'text-2xl opacity-20' },
  ],
  chapel:        [
    { emoji: '🕯️', x: 22, y: 52, cls: 'anim-flicker',       size: 'text-base' },
    { emoji: '🕯️', x: 72, y: 52, cls: 'anim-flicker-delay',  size: 'text-base' },
    { emoji: '✨', x: 50, y: 18, cls: 'anim-float',           size: 'text-sm' },
  ],
  barbershop:    [
    { emoji: '💈', x: 50, y: 36, cls: 'anim-spin-slow', size: 'text-2xl' },
    { emoji: '✨', x: 75, y: 20, cls: 'anim-float-delay', size: 'text-xs' },
  ],
  cards_room:    [
    { emoji: '🃏', x: 30, y: 42, cls: 'anim-float',       size: 'text-xl' },
    { emoji: '🃏', x: 62, y: 46, cls: 'anim-float-delay', size: 'text-lg' },
  ],
  physiotherapy: [
    { emoji: '💪', x: 65, y: 20, cls: 'anim-breathe', size: 'text-base' },
    { emoji: '🏋️', x: 45, y: 38, cls: 'anim-float',   size: 'text-xl' },
  ],
}

/* ─── Personality emojis + speech ─── */
const PERSONALITY_EMOJI: Record<string, string> = {
  quejica: '👴', cotilla: '👵', mandón: '🧓', devota: '👵',
  sordo: '👴', coqueta: '💃', misterioso: '🕵️', exigente: '👵', normal: '🧓',
}
const SPEECH: Record<string, string[]> = {
  quejica:    ['¡Este arroz está seco!', 'Llevo esperando media hora', '¿Pero es que nadie trabaja aquí?'],
  cotilla:    ['¿Viste lo que hizo Don Paco?', 'Entre tú y yo...', 'Eso que te cuento...'],
  mandón:     ['Aquí mando yo', 'JR, que no tenemos todo el día'],
  devota:     ['Ave María Purísima', '¡Hay que ir a misa!'],
  sordo:      ['¿Cómo dices?', '¡Muy bien, gracias!'],
  coqueta:    ['Hay que cuidarse', 'Yo a tu edad era un peligro'],
  misterioso: ['...', 'Ya pasará'],
  exigente:   ['Le falta sal', 'En mi comedor escolar, nunca'],
  normal:     ['Buenas tardes', '¿A qué hora es la cena?'],
}
const SPEECH_EVENT: Record<string, string[]> = {
  hunger: ['Me muero de hambre...'], medication: ['Esas pastillas no...'],
  tv_dispute: ['¡El mando es mío!'], fallen: ['Ay, mi cadera...'],
  hygiene: ['¿Dónde está la ducha?'], companionship: ['Qué solo estoy...'],
  family_visit: ['¡Que vienen mis hijos!'], inspection: ['¿Quién es ese señor?'],
}
const EVENT_CFG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  hygiene:       { emoji: '💧',   label: 'Higiene urgente',  color: '#60a5fa', bg: 'rgba(37,99,235,0.9)'   },
  fallen:        { emoji: '🩹',   label: 'Se ha caído',      color: '#f87171', bg: 'rgba(220,38,38,0.9)'   },
  tv_dispute:    { emoji: '📺',   label: 'Pelea por la tele',color: '#c084fc', bg: 'rgba(124,58,237,0.9)'  },
  missing:       { emoji: '❓',   label: 'Ha salido solo',   color: '#fbbf24', bg: 'rgba(217,119,6,0.9)'   },
  hunger:        { emoji: '🍽️',  label: 'No ha comido',     color: '#fb923c', bg: 'rgba(234,88,12,0.9)'   },
  medication:    { emoji: '💊',   label: 'Rechaza pastillas',color: '#f472b6', bg: 'rgba(219,39,119,0.9)'  },
  companionship: { emoji: '💔',   label: 'Pide compañía',    color: '#fb7185', bg: 'rgba(225,29,72,0.9)'   },
  entertainment: { emoji: '😴',   label: 'Muy aburrido',     color: '#94a3b8', bg: 'rgba(71,85,105,0.9)'   },
  locked_in:     { emoji: '🔒',   label: 'Se ha encerrado',  color: '#94a3b8', bg: 'rgba(100,116,139,0.9)' },
  family_visit:  { emoji: '👨‍👩‍👧', label: 'Visita familiar',  color: '#f9a8d4', bg: 'rgba(190,24,93,0.9)'   },
  inspection:    { emoji: '🔍',   label: 'Inspector Ramírez',color: '#60a5fa', bg: 'rgba(37,99,235,0.9)'   },
}

function getDayTint(): { overlay: string; label: string } {
  const h = new Date().getHours()
  if (h >= 0  && h < 6)  return { overlay: 'rgba(8,4,24,0.6)',   label: '🌙 Madrugada' }
  if (h >= 6  && h < 9)  return { overlay: 'rgba(100,50,0,0.22)',label: '🌅 Amanecer'   }
  if (h >= 9  && h < 14) return { overlay: 'rgba(0,0,0,0)',      label: '☀️ Mañana'     }
  if (h >= 14 && h < 18) return { overlay: 'rgba(0,0,0,0)',      label: '🌤 Tarde'      }
  if (h >= 18 && h < 21) return { overlay: 'rgba(60,20,0,0.3)',  label: '🌇 Atardecer'  }
  return { overlay: 'rgba(8,4,32,0.5)', label: '🌃 Noche' }
}

interface Collectible { id: string; residentId: string; type: 'coin'|'heart'|'star'; x: number; y: number; value: number }
interface Zone { id:string; type:string; label:string; icon:string; col:number; row:number; isOther:boolean; cfg:typeof ROOM_CFG[string] }

function buildZones(rooms: Room[]): Zone[] {
  const beds = rooms.filter(r => r.type === 'bedroom')
  const rawOthers = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))
  const others = [...rawOthers.filter(t => t !== 'garden'), ...rawOthers.filter(t => t === 'garden')]
  const zones: Zone[] = []
  beds.forEach((_, i) => zones.push({ id: `bedroom-${i}`, type: 'bedroom', label: beds.length > 1 ? `Hab. ${i+1}` : 'Habitación', icon: '🛏️', col: i%2, row: Math.floor(i/2), isOther: false, cfg: ROOM_CFG.bedroom }))
  if (beds.length % 2 !== 0 && beds.length > 0)
    zones.push({ id: 'slot-empty', type: 'empty', label:'', icon:'', col:1, row:Math.floor(beds.length/2), isOther:false, cfg:{icon:'',label:'',bg:'#07080e',border:'#12122a',text:'#111',glow:'0,0,0'} })
  let col=0, row=0
  others.forEach(type => {
    const full = type === 'garden'
    if (full && col !== 0) { col=0; row++ }
    zones.push({ id:type, type, label: ROOM_CFG[type]?.label||type, icon: ROOM_CFG[type]?.icon||'🏠', col: full?2:col, row, isOther:true, cfg: ROOM_CFG[type]||ROOM_CFG.bedroom })
    if (full) { row++; col=0 } else { col++; if (col>=2) { col=0; row++ } }
  })
  return zones
}

function zonePx(zone:Zone, bedroomRows:number, cW:number): {x:number;y:number;w:number;h:number} {
  const colW=cW/2
  const y=zone.isOther ? bedroomRows*ROOM_H+CORRIDOR_H+zone.row*ROOM_H : zone.row*ROOM_H
  const x=zone.col===2?0:zone.col*colW
  const w=zone.col===2?cW:colW
  return {x,y,w,h:ROOM_H}
}

interface Props {
  residence: Residence; residents: Resident[]; events: GameEvent[]; rooms: Room[]
  onResolve: (id:string) => Promise<void>; onGoToBuild: () => void
  onRepairRoom?: (roomId:string) => Promise<void>
  onOpenMiniGame?: (ev:GameEvent, r:Resident) => void
  onFamilyVisit?: (ev:GameEvent, r:Resident) => void
  onInspection?: (ev:GameEvent) => void
  onCollect?: (value:number, type:'money'|'xp') => void
  onCare?: (residentId:string, action:'feed'|'medicate'|'chat') => Promise<void>
}

export default function IsometricGameMap({
  residence, residents, events, rooms,
  onResolve, onGoToBuild, onRepairRoom,
  onOpenMiniGame, onFamilyVisit, onInspection, onCollect, onCare
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(340)
  const prevRoomRef = useRef<Record<string,string>>({})
  const [walking, setWalking] = useState<Set<string>>(new Set())
  const [resolving, setResolving] = useState<string|null>(null)
  const [bubbles, setBubbles] = useState<Record<string,string>>({})
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [collected, setCollected] = useState<{id:string;text:string;x:number;y:number}[]>([])
  const [jrPos, setJrPos] = useState<{x:number;y:number}|null>(null)
  const [jrVisible, setJrVisible] = useState(false)
  const [dayTint, setDayTint] = useState<{overlay:string;label:string}>({overlay:'rgba(0,0,0,0)',label:'🌤'})
  const [popupResident, setPopupResident] = useState<string|null>(null)
  const [caringAction, setCaringAction] = useState<string|null>(null)
  useEffect(() => { setDayTint(getDayTint()) }, [])

  useEffect(() => {
    const m = () => { if (containerRef.current) setContainerW(containerRef.current.offsetWidth) }
    m(); window.addEventListener('resize', m); return () => window.removeEventListener('resize', m)
  }, [])

  // Walking
  useEffect(() => {
    const nw = new Set<string>()
    residents.forEach(r => {
      const prev = prevRoomRef.current[r.id]; const curr = r.current_room_type||'bedroom'
      if (prev && prev !== curr) nw.add(r.id)
      prevRoomRef.current[r.id] = curr
    })
    if (nw.size > 0) { setWalking(nw); const t=setTimeout(()=>setWalking(new Set()),1400); return ()=>clearTimeout(t) }
  }, [residents])

  // Speech bubbles
  useEffect(() => {
    if (!residents.length) return
    const go = (): ReturnType<typeof setTimeout> => setTimeout(() => {
      const r = residents[Math.floor(Math.random()*residents.length)]
      if (!r) return go()
      const evs = events.filter(e=>e.resident_id===r.id)
      const pool = evs.length ? (SPEECH_EVENT[evs[0].type]||SPEECH[r.personality]||SPEECH.normal) : (SPEECH[r.personality]||SPEECH.normal)
      const txt = pool[Math.floor(Math.random()*pool.length)]
      setBubbles(p=>({...p,[r.id]:txt}))
      setTimeout(()=>setBubbles(p=>{const n={...p};delete n[r.id];return n}),3500)
      go()
    }, 11000 + Math.random()*11000)
    const t=go(); return ()=>clearTimeout(t)
  }, [residents.length])

  const zones = useMemo(() => buildZones(rooms), [rooms])
  const bedroomRows = Math.max(1, Math.ceil(rooms.filter(r=>r.type==='bedroom').length/2))
  const otherTypes = Array.from(new Set(rooms.filter(r=>r.type!=='bedroom').map(r=>r.type)))
  const otherRows = Math.ceil(otherTypes.filter(t=>t!=='garden').length/2) + (otherTypes.includes('garden')?1:0)
  const totalH = bedroomRows*ROOM_H + CORRIDOR_H + otherRows*ROOM_H + 8

  const { residentZone, zoneResidents } = useMemo(() => {
    const rz: Record<string,Zone> = {}; const zr: Record<string,string[]> = {}
    const beds = zones.filter(z=>z.type==='bedroom'); let bIdx=0
    residents.forEach(r => {
      const rt = r.current_room_type||'bedroom'
      let zone: Zone|undefined
      if (rt==='bedroom') { zone=beds[bIdx%Math.max(beds.length,1)]; bIdx++ }
      else { zone=zones.find(z=>z.id===rt); if (!zone) { zone=beds[bIdx%Math.max(beds.length,1)]; bIdx++ } }
      if (!zone) return
      rz[r.id]=zone; if (!zr[zone.id]) zr[zone.id]=[]
      zr[zone.id].push(r.id)
    })
    return { residentZone:rz, zoneResidents:zr }
  }, [residents, zones])

  const residentZoneRef = useRef(residentZone)
  const bedroomRowsRef  = useRef(bedroomRows)
  useEffect(() => { residentZoneRef.current=residentZone; bedroomRowsRef.current=bedroomRows }, [residentZone, bedroomRows])

  const eventsByZone = useMemo(() => {
    const map: Record<string,GameEvent[]> = {}
    events.forEach(e => {
      const z = residentZone[e.resident_id]; if (!z) return
      if (!map[z.id]) map[z.id]=[]
      map[z.id].push(e)
    })
    return map
  }, [events, residentZone])

  function getResidentPx(rid: string): {x:number;y:number}|null {
    const zone=residentZone[rid]; if (!zone) return null
    const px=zonePx(zone,bedroomRows,containerW)
    const ids=zoneResidents[zone.id]||[]; const idx=ids.indexOf(rid); const count=ids.length
    // 2-per-row grid: row 0 = top, row 1 = bottom
    const perRow = 2
    const col = idx % perRow
    const row = Math.floor(idx / perRow)
    const rowCount = Math.ceil(count / perRow)
    // X: spread across half or full width depending on items in this row
    const itemsInRow = Math.min(perRow, count - row * perRow)
    const XCOLS: Record<number,number[]> = { 1:[0.5], 2:[0.28,0.72] }
    const xFrac = (XCOLS[itemsInRow] ?? [0.28,0.72])[col]
    // Y: if 1 row centre vertically, if 2 rows split
    const yOffset = rowCount === 1 ? 38 : row === 0 ? 28 : 74
    return { x: px.x + px.w * xFrac - 17, y: px.y + yOffset }
  }

  // ─── Collectibles ───
  const spawnCollectible = useCallback(() => {
    if (!residents.length) return
    const r = residents[Math.floor(Math.random()*residents.length)]
    const zone = residentZoneRef.current[r.id]; if (!zone) return
    const px = zonePx(zone, bedroomRowsRef.current, containerW)
    const x = px.x + px.w*(0.25+Math.random()*0.5); const y = px.y + 14
    const rnd=Math.random(); const type=rnd<0.55?'coin':rnd<0.82?'heart':'star' as const
    const value=type==='coin'?40+Math.floor(Math.random()*60):type==='heart'?5:3
    const id=Date.now().toString()+Math.random()
    setCollectibles(p=>[...p,{id,residentId:r.id,type,x,y,value}])
    setTimeout(()=>setCollectibles(p=>p.filter(c=>c.id!==id)),9000)
  }, [residents, containerW])

  useEffect(() => {
    if (!residents.length) return
    const iv=setInterval(spawnCollectible, 38000+Math.random()*30000)
    const first=setTimeout(spawnCollectible, 7000)
    return ()=>{ clearInterval(iv); clearTimeout(first) }
  }, [spawnCollectible])

  function handleCollect(coll: Collectible) {
    setCollectibles(p=>p.filter(c=>c.id!==coll.id))
    const label=coll.type==='coin'?`+${coll.value}€`:coll.type==='heart'?`+${coll.value} ánimo`:`+${coll.value} XP`
    setCollected(p=>[...p,{id:coll.id,text:label,x:coll.x,y:coll.y}])
    setTimeout(()=>setCollected(p=>p.filter(c=>c.id!==coll.id)),1200)
    if (onCollect) onCollect(coll.value, coll.type==='star'?'xp':'money')
    navigator.vibrate?.(40)
  }

  // ─── Event handler ───
  async function handleResolve(ev: GameEvent) {
    const r=residents.find(x=>x.id===ev.resident_id)
    if (ev.type==='inspection'&&onInspection) { navigator.vibrate?.([60,30,60]); onInspection(ev); return }
    if (!r) return
    const pos=getResidentPx(ev.resident_id)
    if (pos) { setJrPos(pos); setJrVisible(true); setTimeout(()=>setJrVisible(false),2200) }
    navigator.vibrate?.(ev.urgency==='critical'?[80,40,80,40,120]:[50,30,80])
    if (ev.type==='family_visit'&&onFamilyVisit) { onFamilyVisit(ev,r); return }
    if (['medication','fallen','hunger','tv_dispute'].includes(ev.type)&&onOpenMiniGame) { onOpenMiniGame(ev,r); return }
    setResolving(ev.id); await onResolve(ev.id); setResolving(null)
  }

  // ─── Resident popup care ───
  async function handlePopupCare(residentId: string, action: 'feed'|'medicate'|'chat') {
    if (!onCare) return
    setCaringAction(`${residentId}:${action}`)
    await onCare(residentId, action)
    setCaringAction(null)
  }

  const brokenRoom = rooms.find(r=>r.broken)
  const COLL_EMOJI = { coin:'💰', heart:'💝', star:'⭐' }
  const popupResidentData = popupResident ? residents.find(r=>r.id===popupResident) : null
  const popupPos = popupResident ? getResidentPx(popupResident) : null

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <StatsBar residence={residence} events={events} residents={residents} dayLabel={dayTint.label} />
        <div className="card text-center py-12">
          <p className="text-6xl mb-3">🏗️</p>
          <p className="text-slate-300 font-bold text-base">La residencia está vacía</p>
          <p className="text-slate-600 text-sm mt-1 mb-5">Construye la primera habitación</p>
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
          <div className="flex-1"><p className="text-red-300 font-bold text-sm">La tele está rota</p><p className="text-red-600 text-xs">El ocio se degrada el doble</p></div>
          <button onClick={()=>onRepairRoom(brokenRoom.id)} className="text-xs px-3 py-2 rounded-xl font-bold active:scale-95 transition-transform shrink-0" style={{background:'rgba(239,68,68,0.2)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.35)'}}>150€ 🔧</button>
        </div>
      )}
      {residents.some(r=>r.activity==='hospitalizado — esperando traslado') && (
        <div className="card card-red animate-pulse">
          <p className="text-red-300 font-bold text-sm">🏥 Residente hospitalizado</p>
          <p className="text-red-600 text-xs mt-0.5">−500€ y −10 reputación por urgencia no atendida</p>
        </div>
      )}

      {/* ═══ 3D MAP ═══ */}
      <div className="w-full rounded-2xl overflow-hidden relative" style={{border:'1px solid rgba(255,255,255,0.07)',perspective:'1100px',perspectiveOrigin:'50% -15%'}}>

        {/* Rotated 3D map layer */}
        <div ref={containerRef} className="relative w-full" style={{transform:'rotateX(13deg) scale(1.025)',transformOrigin:'50% 0%',height:`${totalH}px`,background:'linear-gradient(180deg,#09090f 0%,#07080d 100%)'}}>

          {/* Floor grid */}
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(rgba(80,100,200,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(80,100,200,0.06) 1px,transparent 1px)`,backgroundSize:'38px 38px'}} />

          {/* Room tiles */}
          {zones.filter(z=>z.type!=='empty').map(zone => {
            const px=zonePx(zone,bedroomRows,containerW)
            const zEvs=eventsByZone[zone.id]||[]
            const hasCrit=zEvs.some(e=>e.urgency==='critical')
            const rd=rooms.find(r=>r.type===zone.type)
            const isBroken=rd?.broken&&zone.type==='tv_room'
            // Residents in this zone with critical needs (< 20)
            const zoneResidentIds=zoneResidents[zone.id]||[]
            const hasNeedCrit=zoneResidentIds.some(rid=>{
              const r=residents.find(x=>x.id===rid)
              return r&&(['hunger','medication','companionship'] as const).some(n=>r[n]<20)
            })
            const cfg=zone.cfg; const bc=isBroken?'#ef4444':cfg.border
            const glow=isBroken?'239,68,68':hasCrit?'239,68,68':hasNeedCrit?'251,146,60':cfg.glow
            const ambient=ROOM_AMBIENT[zone.type]||[]
            return (
              <div key={zone.id} className="absolute" style={{left:px.x+3,top:px.y+3,width:px.w-6,height:px.h-6,background:cfg.bg,border:`1px solid ${bc}`,borderRadius:'12px 12px 6px 6px',boxShadow:`0 7px 0 rgba(0,0,0,0.5),0 11px 18px rgba(0,0,0,0.45),0 0 22px 3px rgba(${glow},0.28),inset 0 1px 0 rgba(255,255,255,0.07)`}}>

                {/* Top shine */}
                <div className="absolute inset-x-0 top-0 h-8 rounded-t-xl pointer-events-none" style={{background:`linear-gradient(to bottom,rgba(255,255,255,0.09),transparent)`}} />

                {/* Room header */}
                <div className="flex items-center gap-2 px-2.5 pt-2 relative z-10">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl shrink-0" style={{background:`rgba(${glow},0.18)`,border:`1px solid rgba(${glow},0.3)`}}>
                    {isBroken?'💥':zone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black leading-tight truncate" style={{color:cfg.text}}>{zone.label}</p>
                    {rd && rd.level>1 && <p className="text-[8px] font-bold" style={{color:`rgba(${glow},0.7)`}}>Nv.{rd.level}</p>}
                  </div>
                  {zEvs.length>0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${hasCrit?'bg-red-500 text-white animate-pulse':'text-white'}`} style={!hasCrit?{background:`rgba(${glow},0.35)`}:undefined}>{zEvs.length}⚠</span>
                  )}
                </div>

                {/* Ambient decorations */}
                {ambient.map((item,i) => (
                  <div key={i} className={`absolute pointer-events-none ${item.cls} ${item.size||'text-base'}`}
                    style={{left:`${item.x}%`,top:`${item.y}%`,transform:'translateX(-50%)',zIndex:5,opacity:0.75}}>
                    {item.emoji}
                  </div>
                ))}

                {/* Event buttons */}
                {zEvs.length>0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
                    {zEvs.slice(0,2).map(ev => {
                      const c=EVENT_CFG[ev.type]||{emoji:'⚠️',label:'Problema',color:'#94a3b8',bg:'rgba(100,100,100,0.9)'}
                      const maxTicks=ev.urgency==='normal'?4:8
                      const pct=ev.unresolved_ticks>0?Math.max(0,100-(ev.unresolved_ticks/maxTicks*100)):100
                      return (
                        <button key={ev.id} onClick={()=>handleResolve(ev)} disabled={resolving===ev.id}
                          className="relative flex items-center gap-2 px-2.5 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-50 overflow-hidden text-left"
                          style={{background:c.bg,border:'1px solid rgba(255,255,255,0.15)'}}>
                          {/* Urgency countdown bar */}
                          <div className="absolute inset-x-0 bottom-0 h-0.5" style={{background:'rgba(0,0,0,0.3)'}}>
                            <div className="h-full rounded-full" style={{width:`${pct}%`,background:pct>60?'rgba(255,255,255,0.5)':pct>30?'rgba(255,200,0,0.8)':'rgba(255,50,50,0.9)',transition:'width 1s linear'}} />
                          </div>
                          <span className={`text-base shrink-0 ${ev.urgency==='critical'?'animate-event':''}`}>{c.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[9px] font-black leading-tight truncate">{ev.type==='inspection'?'Inspector Ramírez':(ev as GameEvent&{residents?:{name:string}}).residents?.name}</p>
                            <p className="text-white/70 text-[8px]">{c.label}</p>
                          </div>
                          <span className="text-white text-xs font-bold shrink-0">{resolving===ev.id?'⏳':'👆'}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Resident happiness bar */}
                {zoneResidentIds.length > 0 && (() => {
                  const ids = zoneResidents[zone.id] || []
                  const avg = ids.length ? Math.round(ids.reduce((s,id)=>{const r=residents.find(x=>x.id===id);return s+(r?.happiness??50)},0)/ids.length) : 0
                  const col = avg>=70?'#22c55e':avg>=40?'#f59e0b':'#ef4444'
                  return (
                    <div className="absolute bottom-0 inset-x-0 h-1 rounded-b-lg overflow-hidden pointer-events-none" style={{background:'rgba(0,0,0,0.35)'}}>
                      <div className="h-full rounded-b-lg transition-all duration-1000" style={{width:`${avg}%`,background:col,opacity:0.8}} />
                    </div>
                  )
                })()}
                {/* Bottom depth */}
                <div className="absolute bottom-1 inset-x-0 h-1 pointer-events-none" style={{background:'linear-gradient(to bottom,transparent,rgba(0,0,0,0.3))'}} />
              </div>
            )
          })}

          {/* Corridor */}
          <div className="absolute flex items-center gap-2 px-4" style={{left:2,top:bedroomRows*ROOM_H+1,width:containerW-4,height:CORRIDOR_H-2,background:'#07080e',borderTop:'1px solid rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <div className="flex-1 h-px" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)'}} />
            <span className="text-[8px] text-slate-700 tracking-[0.35em] uppercase shrink-0">pasillo</span>
            <div className="flex-1 h-px" style={{background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)'}} />
          </div>

          {/* Residents — TAPPABLE */}
          {residents.map(res => {
            const pos=getResidentPx(res.id); if (!pos) return null
            const isWalking=walking.has(res.id)
            const hasEvent=events.some(e=>e.resident_id===res.id)
            const bubble=bubbles[res.id]
            const hc=res.happiness>=70?'#22c55e':res.happiness>=40?'#f59e0b':res.happiness>=20?'#f97316':'#ef4444'
            const isHosp=res.activity==='hospitalizado — esperando traslado'
            const isSelected=popupResident===res.id
            return (
              <div key={res.id} className="absolute" style={{left:pos.x,top:pos.y,width:34,transition:'left 1.1s cubic-bezier(0.4,0,0.2,1),top 1.1s cubic-bezier(0.4,0,0.2,1)',zIndex:isSelected?25:10}}>
                {bubble && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 animate-bounce-in"
                    style={{whiteSpace:'nowrap',background:'rgba(255,255,255,0.96)',color:'#0f172a',fontSize:9,fontWeight:700,padding:'3px 7px',borderRadius:8,maxWidth:120,lineHeight:1.3,boxShadow:'0 2px 14px rgba(0,0,0,0.55)'}}>
                    {bubble}
                    <div style={{position:'absolute',bottom:-4,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'4px solid transparent',borderRight:'4px solid transparent',borderTop:'4px solid rgba(255,255,255,0.96)'}} />
                  </div>
                )}
                {hasEvent && <div className="absolute -top-2 -right-1 text-xs animate-bounce z-20">🔴</div>}
                {isHosp   && <div className="absolute -top-2 -left-1 text-xs z-20">🏥</div>}
                {isSelected && <div className="absolute -inset-1 rounded-full border-2 border-white/60 animate-pulse" />}
                {/* Tappable sprite */}
                <button
                  className="block w-full pointer-events-auto active:scale-90 transition-transform"
                  onClick={() => setPopupResident(popupResident===res.id?null:res.id)}
                >
                  <div className={`text-[26px] text-center leading-none ${isHosp?'opacity-35':isWalking?'animate-walk':'animate-idle'}`} style={{filter:`drop-shadow(0 2px 8px ${hc}70)`}}>
                    {isHosp?'🛌':isWalking?'🚶':(PERSONALITY_EMOJI[res.personality]||'🧓')}
                  </div>
                </button>
                <div className="w-6 h-1 rounded-full mx-auto mt-0.5" style={{background:'rgba(255,255,255,0.1)'}}>
                  <div className="h-full rounded-full transition-all duration-700" style={{width:`${res.happiness}%`,background:hc}} />
                </div>
                <p className="text-[8px] text-slate-400 text-center font-bold mt-0.5 leading-none">{res.name.split(' ')[0]}</p>
              </div>
            )
          })}

          {/* ★ Collectibles */}
          {collectibles.map(coll => (
            <button key={coll.id} onClick={()=>handleCollect(coll)} className="absolute z-20 animate-collectible active:scale-125 transition-transform" style={{left:coll.x-18,top:coll.y-20,width:36,height:36}}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                style={{background:coll.type==='coin'?'rgba(245,158,11,0.92)':coll.type==='heart'?'rgba(236,72,153,0.92)':'rgba(139,92,246,0.92)',boxShadow:`0 0 18px 5px ${coll.type==='coin'?'rgba(245,158,11,0.65)':coll.type==='heart'?'rgba(236,72,153,0.65)':'rgba(139,92,246,0.65)'}`,border:'2px solid rgba(255,255,255,0.55)'}}>
                {COLL_EMOJI[coll.type]}
              </div>
            </button>
          ))}
          {collected.map(c => (
            <div key={c.id} className="absolute z-30 pointer-events-none animate-collect-fly" style={{left:c.x-28,top:c.y-10,width:70,textAlign:'center'}}>
              <span className="text-xs font-black text-white" style={{textShadow:'0 0 8px rgba(245,158,11,0.9),0 1px 3px rgba(0,0,0,0.9)'}}>{c.text}</span>
            </div>
          ))}

          {/* JR sprite */}
          {jrVisible && jrPos && (
            <div className="absolute pointer-events-none z-20" style={{left:jrPos.x-4,top:jrPos.y-4,width:32,transition:'left 0.5s ease-out,top 0.5s ease-out'}}>
              <div className="text-[26px] text-center animate-walk drop-shadow-lg">👨‍⚕️</div>
              <p className="text-[8px] text-emerald-400 text-center font-black">JR</p>
            </div>
          )}

          {/* Day/night overlay */}
          {dayTint.overlay!=='rgba(0,0,0,0)' && (
            <div className="absolute inset-0 pointer-events-none z-30 transition-all duration-[3000ms]" style={{background:dayTint.overlay}} />
          )}

          {/* Build button */}
          <button onClick={onGoToBuild} className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold active:scale-95 transition-transform" style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',color:'#fbbf24',backdropFilter:'blur(8px)'}}>
            🔨 Nueva sala
          </button>
        </div>

        {/* ─ Resident popup (outside rotated div, inside perspective container) ─ */}
        {popupResidentData && popupPos && (
          <div className="absolute z-50 pointer-events-none" style={{left:0,top:0,width:'100%',height:`${totalH}px`}}>
            <div className="pointer-events-auto animate-popup-in" style={{
              position:'absolute',
              left: Math.max(8, Math.min(containerW-196, popupPos.x-82)),
              top:  Math.max(8, popupPos.y - 168),
              width:188,
              background:'rgba(9,11,20,0.97)',
              border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:16,
              boxShadow:'0 8px 32px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05)',
              backdropFilter:'blur(16px)',
              padding:'12px',
            }}>
              {/* Close */}
              <button onClick={()=>setPopupResident(null)} className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-slate-500 active:scale-90" style={{background:'rgba(255,255,255,0.07)'}}>✕</button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-2.5 pr-4">
                <div className="text-2xl leading-none">{PERSONALITY_EMOJI[popupResidentData.personality]||'🧓'}</div>
                <div>
                  <p className="text-slate-200 font-black text-sm leading-none">{popupResidentData.name.split(' ')[0]}</p>
                  <p className="text-slate-500 text-[10px]">{popupResidentData.age} años · {popupResidentData.personality}</p>
                </div>
              </div>

              {/* Happiness */}
              <div className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-slate-500">Ánimo</span>
                  <span className="text-[9px] font-bold" style={{color:popupResidentData.happiness>=70?'#22c55e':popupResidentData.happiness>=40?'#f59e0b':'#ef4444'}}>{popupResidentData.happiness}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.07)'}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${popupResidentData.happiness}%`,background:popupResidentData.happiness>=70?'#22c55e':popupResidentData.happiness>=40?'#f59e0b':'#ef4444'}} />
                </div>
              </div>

              {/* Mini needs (only critical ones) */}
              {(['hunger','medication','companionship'] as const).map(n => {
                const val = popupResidentData[n]; const col=val<30?'#ef4444':val<55?'#f59e0b':'#22c55e'
                const icons: Record<string,string> = {hunger:'🍽️',medication:'💊',companionship:'💬'}
                return (
                  <div key={n} className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs">{icons[n]}</span>
                    <div className="flex-1 h-1 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                      <div className="h-full rounded-full" style={{width:`${val}%`,background:col,transition:'width 0.5s'}} />
                    </div>
                    <span className="text-[9px] font-bold w-5 text-right" style={{color:col}}>{val}</span>
                  </div>
                )
              })}

              {/* Care buttons */}
              {onCare && (
                <div className="flex gap-1.5 mt-3">
                  {([
                    {id:'feed'   as const, emoji:'🍽️', label:'15€',   color:'rgba(245,158,11,0.2)',  border:'rgba(245,158,11,0.45)', disabled:residence.money<15},
                    {id:'medicate' as const, emoji:'💊', label:'25€', color:'rgba(236,72,153,0.2)',  border:'rgba(236,72,153,0.45)', disabled:residence.money<25},
                    {id:'chat'   as const, emoji:'💬', label:'-10⚡', color:'rgba(96,165,250,0.2)',  border:'rgba(96,165,250,0.45)',  disabled:residence.jr_energy<10},
                  ]).map(a => (
                    <button key={a.id}
                      onClick={()=>handlePopupCare(popupResidentData.id,a.id)}
                      disabled={a.disabled||caringAction===`${popupResidentData.id}:${a.id}`}
                      className="flex-1 flex flex-col items-center py-1.5 rounded-xl text-[9px] font-bold active:scale-95 transition-all disabled:opacity-35"
                      style={{background:a.color,border:`1px solid ${a.border}`,color:'#e2e8f0'}}>
                      <span className="text-base leading-none">{caringAction===`${popupResidentData.id}:${a.id}`?'⏳':a.emoji}</span>
                      <span className="mt-0.5 opacity-70">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsBar({residence,events,residents,dayLabel}:{residence:Residence;events:GameEvent[];residents:Resident[];dayLabel:string}) {
  const critical=events.filter(e=>e.urgency==='critical').length
  const avg=residents.length?Math.round(residents.reduce((s,r)=>s+r.happiness,0)/residents.length):0
  const streak=residence.streak_days??0
  const avgColor=avg>=60?'#22c55e':avg>=35?'#f97316':'#ef4444'
  const urgColor=events.length===0?'#22c55e':critical>0?'#ef4444':'#fbbf24'

  return (
    <div className="rounded-2xl overflow-hidden" style={{background:'rgba(9,11,20,0.95)',border:'1px solid rgba(255,255,255,0.07)'}}>
      <div className="flex items-stretch">

        {/* Money */}
        <div className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
          <p className="text-[10px] text-slate-600 leading-none">Fondos</p>
          <p className="text-green-400 font-black text-sm leading-tight">{residence.money>=1000?`${(residence.money/1000).toFixed(1)}k€`:`${residence.money}€`}</p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{background:'rgba(255,255,255,0.06)'}} />

        {/* JR level */}
        <div className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
          <p className="text-[10px] text-slate-600 leading-none">JR</p>
          <p className="text-amber-400 font-black text-sm leading-tight">Nv.{residence.level}</p>
        </div>

        <div className="w-px self-stretch" style={{background:'rgba(255,255,255,0.06)'}} />

        {/* Mood */}
        <div className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
          <p className="text-[10px] text-slate-600 leading-none">Ánimo</p>
          <p className="font-black text-sm leading-tight" style={{color:avgColor}}>{avg}%</p>
        </div>

        <div className="w-px self-stretch" style={{background:'rgba(255,255,255,0.06)'}} />

        {/* Events */}
        <div className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 ${critical>0?'animate-pulse':''}`}>
          <p className="text-[10px] text-slate-600 leading-none">Urgencias</p>
          <p className="font-black text-sm leading-tight" style={{color:urgColor}}>
            {events.length===0?'😌':critical>0?`🚨${critical}`:`⚠️${events.length}`}
          </p>
        </div>
      </div>

      {/* Bottom strip: day + streak */}
      {(streak>0||dayLabel) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t" style={{borderColor:'rgba(255,255,255,0.05)'}}>
          <p className="text-slate-700 text-[10px]">{dayLabel}</p>
          {streak>0 && (
            <p className={`text-[10px] font-black ${streak>=7?'text-yellow-400':streak>=3?'text-orange-400':'text-slate-600'}`}>
              🔥 {streak} días
            </p>
          )}
        </div>
      )}
    </div>
  )
}
