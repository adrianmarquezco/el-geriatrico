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

interface Props {
  rooms: Room[]
  money: number
  onBuild: (roomType: string) => Promise<boolean>
}

export default function RoomsPanel({ rooms, money, onBuild }: Props) {
  const [building, setBuilding] = useState<string | null>(null)
  const builtTypes = rooms.map(r => r.type)
  const bedroomCount = rooms.filter(r => r.type === 'bedroom').length

  async function handleBuild(type: string) {
    setBuilding(type)
    await onBuild(type)
    setBuilding(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-400 font-semibold text-sm">Ampliar residencia</h2>
        <span className="text-green-400 font-bold text-sm">💰 {money.toLocaleString('es-ES')}€</span>
      </div>

      {rooms.length > 0 && (
        <div className="card bg-amber-900/20">
          <p className="text-amber-600 text-xs font-semibold mb-2">Ya construido</p>
          <div className="flex flex-wrap gap-2">
            {ROOMS.filter(r => builtTypes.includes(r.type)).map(r => (
              <span key={r.type} className="badge bg-amber-900 text-amber-400">
                {r.icon} {r.label} {r.type === 'bedroom' && bedroomCount > 1 ? `×${bedroomCount}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

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
