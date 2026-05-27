'use client'
import { useState } from 'react'
import { Room } from '@/lib/types'

const ROOMS = [
  { type: 'bedroom',       icon: '🛏️', label: 'Habitación',    cost: 1000, description: 'Acoge a un nuevo residente. Cada una desbloquea un personaje único.', repeatable: true },
  { type: 'tv_room',       icon: '📺', label: 'Sala de TV',     cost: 2000, description: 'Reduce urgencias de entretenimiento. Ojo con el mando a distancia.' },
  { type: 'dining_room',   icon: '🍽️', label: 'Comedor',        cost: 2500, description: 'Mejora la alimentación. Encarna seguirá quejándose igualmente.' },
  { type: 'garden',        icon: '🌳', label: 'Jardín',         cost: 3000, description: 'Sube el humor general. Alfredo saldrá en pijama de todos modos.' },
  { type: 'infirmary',     icon: '🏥', label: 'Enfermería',     cost: 4000, description: 'Reduce urgencias de medicación. Vital a partir de 5 residentes.' },
  { type: 'chapel',        icon: '⛪', label: 'Capilla',        cost: 3500, description: 'Rosario deja de rezar en el pasillo. Los beneficios son espirituales.' },
  { type: 'barbershop',    icon: '💈', label: 'Peluquería',     cost: 2800, description: 'Sube higiene y humor. Lola lo visitará tres veces por semana.' },
  { type: 'cards_room',    icon: '🃏', label: 'Sala de cartas', cost: 3200, description: 'Entretenimiento garantizado. Peleas también garantizadas.' },
  { type: 'physiotherapy', icon: '🤸', label: 'Fisioterapia',   cost: 5000, description: 'Reduce urgencias de caídas. Don Paco dice que no le hace falta.' },
]

const UPGRADE_COST: Record<string, number> = {
  bedroom: 800, tv_room: 1500, dining_room: 2000, garden: 2500,
  infirmary: 3000, chapel: 2500, barbershop: 2000, cards_room: 2500, physiotherapy: 3500,
}

const UPGRADE_EFFECT: Record<string, string> = {
  bedroom: '+5 felicidad base', tv_room: 'Entretenimiento −5%',
  dining_room: 'Hambre −5%', garden: 'Compañía −5%',
  infirmary: 'Medicación −5%', chapel: 'Compañía −5%',
  barbershop: 'Higiene −5%', cards_room: 'Entretenimiento −5%',
  physiotherapy: 'Caídas −15%',
}

interface Props {
  rooms: Room[]
  money: number
  onBuild: (roomType: string) => Promise<boolean>
  onUpgrade: (roomId: string) => Promise<boolean>
}

export default function RoomsPanel({ rooms, money, onBuild, onUpgrade }: Props) {
  const [building, setBuilding] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const builtTypes = rooms.map(r => r.type)
  const bedroomCount = rooms.filter(r => r.type === 'bedroom').length

  // Group rooms by type for display
  const roomsByType: Record<string, Room[]> = {}
  rooms.forEach(r => {
    if (!roomsByType[r.type]) roomsByType[r.type] = []
    roomsByType[r.type].push(r)
  })

  async function handleBuild(type: string) {
    setBuilding(type)
    await onBuild(type)
    setBuilding(null)
  }

  async function handleUpgrade(roomId: string) {
    setUpgrading(roomId)
    await onUpgrade(roomId)
    setUpgrading(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-400 font-semibold text-sm">Construcción y mejoras</h2>
        <span className="text-green-400 font-bold text-sm">💰 {money.toLocaleString('es-ES')}€</span>
      </div>

      {/* Built rooms with upgrade options */}
      {rooms.length > 0 && (
        <div className="card bg-amber-900/20">
          <p className="text-amber-600 text-xs font-semibold mb-2">Ya construido — pulsa para mejorar</p>
          <div className="flex flex-col gap-2">
            {ROOMS.filter(r => builtTypes.includes(r.type)).map(r => {
              const roomsOfType = roomsByType[r.type] || []
              return roomsOfType.map(room => {
                const upgradeCost = (UPGRADE_COST[room.type] || 2000) * room.level
                const canUpgrade = room.level < 5 && money >= upgradeCost
                const isMaxLevel = room.level >= 5
                return (
                  <div key={room.id} className="flex items-center gap-2">
                    <span className="text-base">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-300 text-xs font-semibold">
                        {r.label} {r.type === 'bedroom' && roomsOfType.length > 1 ? `(hab.)` : ''}
                        {' '}
                        <span className="text-amber-600">Nv.{room.level}</span>
                      </p>
                      {!isMaxLevel && (
                        <p className="text-amber-700 text-[10px]">{UPGRADE_EFFECT[room.type]} al Nv.{room.level + 1}</p>
                      )}
                    </div>
                    {isMaxLevel ? (
                      <span className="badge bg-amber-900 text-amber-500">MAX</span>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(room.id)}
                        disabled={!canUpgrade || upgrading === room.id}
                        className={`text-[11px] px-2 py-1 rounded-lg font-bold shrink-0 transition-all ${
                          canUpgrade ? 'bg-amber-800 text-amber-200 hover:bg-amber-700 active:scale-95' : 'bg-amber-900/40 text-amber-800 cursor-not-allowed'
                        } disabled:opacity-60`}
                      >
                        {upgrading === room.id ? '...' : `⬆ ${upgradeCost.toLocaleString('es-ES')}€`}
                      </button>
                    )}
                  </div>
                )
              })
            })}
          </div>
        </div>
      )}

      {/* Build new rooms */}
      {ROOMS.map(room => {
        const isBuilt = !room.repeatable && builtTypes.includes(room.type)
        const canAfford = money >= room.cost
        const isBuilding = building === room.type

        return (
          <div key={room.type} className={`card flex items-center gap-3 transition-opacity ${isBuilt ? 'opacity-40' : ''}`}>
            <span className="text-3xl shrink-0">{room.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-200 text-sm">{room.label}</p>
              <p className="text-amber-600 text-xs leading-snug">{room.description}</p>
            </div>
            <div className="shrink-0">
              {isBuilt ? (
                <span className="badge bg-green-900 text-green-400">✓</span>
              ) : (
                <button
                  onClick={() => handleBuild(room.type)}
                  disabled={!canAfford || isBuilding}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    canAfford ? 'btn-primary' : 'bg-amber-900/40 text-amber-700 border border-amber-800 cursor-not-allowed'
                  } disabled:opacity-60`}
                >
                  {isBuilding ? '...' : `${room.cost.toLocaleString('es-ES')}€`}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
