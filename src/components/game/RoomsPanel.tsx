'use client'
import { useState } from 'react'
import { Room } from '@/lib/types'

const ROOMS = [
  { type: 'bedroom',       icon: '🛏️', label: 'Habitación',    cost: 1000, description: 'Acoge a un nuevo residente. Cada una desbloquea un personaje único.', repeatable: true,  glow: '59,130,246',   border: '#3b82f6' },
  { type: 'tv_room',       icon: '📺', label: 'Sala de TV',     cost: 2000, description: 'Reduce urgencias de entretenimiento. Ojo con el mando a distancia.',  repeatable: false, glow: '168,85,247',   border: '#a855f7' },
  { type: 'dining_room',   icon: '🍽️', label: 'Comedor',        cost: 2500, description: 'Mejora la alimentación. Encarna seguirá quejándose igualmente.',      repeatable: false, glow: '245,158,11',   border: '#f59e0b' },
  { type: 'garden',        icon: '🌿', label: 'Jardín',         cost: 3000, description: 'Sube el humor general. Alfredo saldrá en pijama de todos modos.',      repeatable: false, glow: '34,197,94',    border: '#22c55e' },
  { type: 'infirmary',     icon: '🏥', label: 'Enfermería',     cost: 4000, description: 'Reduce urgencias de medicación. Vital a partir de 5 residentes.',     repeatable: false, glow: '239,68,68',    border: '#ef4444' },
  { type: 'chapel',        icon: '⛪', label: 'Capilla',        cost: 3500, description: 'Rosario deja de rezar en el pasillo. Los beneficios son espirituales.',repeatable: false, glow: '217,119,6',    border: '#d97706' },
  { type: 'barbershop',    icon: '💈', label: 'Peluquería',     cost: 2800, description: 'Sube higiene y humor. Lola lo visitará tres veces por semana.',        repeatable: false, glow: '236,72,153',   border: '#ec4899' },
  { type: 'cards_room',    icon: '🃏', label: 'Sala de cartas', cost: 3200, description: 'Entretenimiento garantizado. Peleas también garantizadas.',             repeatable: false, glow: '37,99,235',    border: '#2563eb' },
  { type: 'physiotherapy', icon: '🤸', label: 'Fisioterapia',   cost: 5000, description: 'Reduce urgencias de caídas. Don Paco dice que no le hace falta.',      repeatable: false, glow: '13,148,136',   border: '#0d9488' },
]

const UPGRADE_COST: Record<string, number> = {
  bedroom: 800, tv_room: 1500, dining_room: 2000, garden: 2500,
  infirmary: 3000, chapel: 2500, barbershop: 2000, cards_room: 2500, physiotherapy: 3500,
}
const UPGRADE_EFFECT: Record<string, string> = {
  bedroom: '+5 felicidad base', tv_room: 'Ocio −5%', dining_room: 'Hambre −5%',
  garden: 'Compañía −5%', infirmary: 'Medicación −5%', chapel: 'Compañía −5%',
  barbershop: 'Higiene −5%', cards_room: 'Ocio −5%', physiotherapy: 'Caídas −15%',
}

interface Props {
  rooms: Room[]; money: number
  onBuild: (roomType: string) => Promise<boolean>
  onUpgrade: (roomId: string) => Promise<boolean>
}

export default function RoomsPanel({ rooms, money, onBuild, onUpgrade }: Props) {
  const [building, setBuilding]   = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const builtTypes = rooms.map(r => r.type)
  const roomsByType: Record<string, Room[]> = {}
  rooms.forEach(r => { if (!roomsByType[r.type]) roomsByType[r.type] = []; roomsByType[r.type].push(r) })

  async function handleBuild(type: string)    { setBuilding(type);  await onBuild(type);   setBuilding(null) }
  async function handleUpgrade(roomId: string){ setUpgrading(roomId); await onUpgrade(roomId); setUpgrading(null) }

  const builtRooms   = ROOMS.filter(r => builtTypes.includes(r.type))
  const unbuiltRooms = ROOMS.filter(r => !builtTypes.includes(r.type) || r.repeatable)

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-200 font-black text-base">Construcción</h2>
          <p className="text-slate-600 text-xs mt-0.5">{rooms.length} salas · {builtRooms.length} tipos</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="text-sm">💰</span>
          <span className="text-green-400 font-black text-sm">{money.toLocaleString('es-ES')}€</span>
        </div>
      </div>

      {/* Built rooms */}
      {builtRooms.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Tus salas</p>
          {ROOMS.filter(r => builtTypes.includes(r.type)).map(r => {
            const roomsOfType = roomsByType[r.type] || []
            return roomsOfType.map(room => {
              const upgradeCost = (UPGRADE_COST[room.type] || 2000) * room.level
              const canUpgrade  = room.level < 5 && money >= upgradeCost
              const isMax       = room.level >= 5
              const levelPct    = (room.level / 5) * 100
              return (
                <div key={room.id} className="relative overflow-hidden rounded-2xl p-3"
                  style={{
                    background: `linear-gradient(135deg,rgba(${r.glow},0.1) 0%,rgba(9,11,20,0.97) 100%)`,
                    border: `1px solid rgba(${r.glow},0.3)`,
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `rgba(${r.glow},0.18)`, border: `1px solid rgba(${r.glow},0.3)` }}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-200 text-sm leading-tight">{r.label}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: `rgba(${r.glow},0.2)`, color: r.border }}>
                          Nv.{room.level}
                        </span>
                        {isMax && <span className="text-[9px] font-black text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-900/40">MAX</span>}
                      </div>
                      {/* Level bar */}
                      <div className="mt-1.5 h-1 rounded-full w-24" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${levelPct}%`, background: `linear-gradient(90deg,${r.border}88,${r.border})` }} />
                      </div>
                    </div>
                    {!isMax && (
                      <button
                        onClick={() => handleUpgrade(room.id)}
                        disabled={!canUpgrade || upgrading === room.id}
                        className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all disabled:opacity-35"
                        style={{
                          background: canUpgrade ? `rgba(${r.glow},0.2)` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${canUpgrade ? `rgba(${r.glow},0.5)` : 'rgba(255,255,255,0.07)'}`,
                          color: canUpgrade ? r.border : '#475569',
                        }}>
                        <span className="text-base leading-none">{upgrading === room.id ? '⏳' : '⬆'}</span>
                        <span>{upgradeCost.toLocaleString('es-ES')}€</span>
                      </button>
                    )}
                  </div>
                  {!isMax && (
                    <p className="text-[10px] mt-2" style={{ color: `rgba(${r.glow},0.6)` }}>
                      Nv.{room.level + 1}: {UPGRADE_EFFECT[room.type]}
                    </p>
                  )}
                </div>
              )
            })
          })}
        </div>
      )}

      {/* Build new */}
      <div className="flex flex-col gap-2">
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Construir</p>
        {unbuiltRooms.map(room => {
          const isBuilt    = !room.repeatable && builtTypes.includes(room.type)
          const canAfford  = money >= room.cost
          const isBuilding = building === room.type

          return (
            <div key={room.type}
              className={`relative overflow-hidden rounded-2xl p-3 transition-all ${isBuilt ? 'opacity-30' : ''}`}
              style={{
                background: isBuilt ? 'rgba(9,11,20,0.5)' : canAfford
                  ? `linear-gradient(135deg,rgba(${room.glow},0.07) 0%,rgba(9,11,20,0.98) 100%)`
                  : 'rgba(9,11,20,0.5)',
                border: `1px solid ${isBuilt ? 'rgba(255,255,255,0.05)' : canAfford ? `rgba(${room.glow},0.25)` : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: isBuilt ? 'rgba(255,255,255,0.04)' : `rgba(${room.glow},0.12)`,
                    border: `1px solid ${isBuilt ? 'rgba(255,255,255,0.06)' : `rgba(${room.glow},0.25)`}`,
                    filter: !canAfford && !isBuilt ? 'grayscale(60%)' : 'none',
                  }}>
                  {isBuilt ? '✅' : room.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm leading-tight" style={{ color: isBuilt ? '#475569' : '#e2e8f0' }}>{room.label}</p>
                  <p className="text-[10px] text-slate-600 leading-snug mt-0.5 line-clamp-2">{room.description}</p>
                </div>
                {!isBuilt && (
                  <button
                    onClick={() => handleBuild(room.type)}
                    disabled={!canAfford || isBuilding}
                    className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all disabled:opacity-40"
                    style={{
                      background: canAfford ? `rgba(${room.glow},0.18)` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${canAfford ? `rgba(${room.glow},0.5)` : 'rgba(255,255,255,0.07)'}`,
                      color: canAfford ? room.border : '#475569',
                    }}>
                    <span className="text-base leading-none">{isBuilding ? '⏳' : canAfford ? '🔨' : '🔒'}</span>
                    <span>{isBuilding ? '...' : `${room.cost.toLocaleString('es-ES')}€`}</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
