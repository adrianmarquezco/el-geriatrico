'use client'
import { Residence, Resident, GameEvent } from '@/lib/types'

const XP_FOR_LEVEL = (level: number) => level * 200

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
}

export default function HomePanel({ residence, residents, events }: Props) {
  const avgHappiness = residents.length
    ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length)
    : 0

  const xpProgress = residence.jr_experience % XP_FOR_LEVEL(residence.level)
  const xpNeeded = XP_FOR_LEVEL(residence.level)
  const criticalEvents = events.filter(e => e.urgency === 'critical').length

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome */}
      <div className="card text-center py-5">
        <p className="text-3xl mb-1">🏠</p>
        <h2 className="font-bold text-amber-300 text-lg">{residence.name}</h2>
        <p className="text-amber-600 text-xs mt-1">
          {residents.length} {residents.length === 1 ? 'residente' : 'residentes'} · Nivel {residence.level}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl">💰</p>
          <p className="font-bold text-green-400 text-lg">{residence.money.toLocaleString('es-ES')}€</p>
          <p className="text-amber-700 text-xs">Fondos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl">⭐</p>
          <p className="font-bold text-amber-300 text-lg">{residence.reputation}</p>
          <p className="text-amber-700 text-xs">Reputación</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl">{avgHappiness >= 70 ? '😊' : avgHappiness >= 40 ? '😐' : '😟'}</p>
          <p className="font-bold text-amber-300 text-lg">{avgHappiness}%</p>
          <p className="text-amber-700 text-xs">Satisfacción media</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl">{events.length === 0 ? '😌' : criticalEvents > 0 ? '🚨' : '⚠️'}</p>
          <p className={`font-bold text-lg ${events.length === 0 ? 'text-green-400' : criticalEvents > 0 ? 'text-red-400' : 'text-orange-400'}`}>
            {events.length}
          </p>
          <p className="text-amber-700 text-xs">Urgencias</p>
        </div>
      </div>

      {/* JR nivel progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber-400 font-semibold text-sm">JR · Nivel {residence.level}</span>
          <span className="text-amber-700 text-xs">{xpProgress}/{xpNeeded} XP</span>
        </div>
        <div className="h-2 bg-amber-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(xpProgress / xpNeeded) * 100}%` }}
          />
        </div>
      </div>

      {/* Residents quick status */}
      {residents.length > 0 && (
        <div className="card">
          <h3 className="text-amber-500 text-xs font-semibold mb-3 uppercase tracking-wide">Estado de los residentes</h3>
          <div className="flex flex-col gap-2">
            {residents.map(r => (
              <div key={r.id} className="flex items-center justify-between">
                <span className="text-amber-300 text-sm">{r.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-amber-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${r.happiness >= 70 ? 'bg-green-500' : r.happiness >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${r.happiness}%` }}
                    />
                  </div>
                  <span className="text-xs">{r.mood === 'feliz' ? '😊' : r.mood === 'enfadado' ? '😠' : r.mood === 'furioso' ? '🤬' : '😐'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card border-amber-700/30 bg-amber-900/20">
        <p className="text-amber-600 text-xs leading-relaxed">
          💡 Los residentes generan <span className="text-amber-400">50€/hora</span> cuando están contentos. Resuelve urgencias para ganar XP y subir de nivel.
        </p>
      </div>
    </div>
  )
}
