'use client'
import { useState } from 'react'
import { Achievement, Residence } from '@/lib/types'

interface Props {
  achievements: Achievement[]
  residence: Residence
}

const ALL_ACHIEVEMENTS: { type: string; icon: string; title: string; desc: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }[] = [
  { type: 'first_event',  icon: '🎯', title: 'Primera urgencia',    desc: 'Resuelve tu primera urgencia',             rarity: 'common'    },
  { type: 'first_staff',  icon: '👩‍⚕️', title: 'El primer fichaje',  desc: 'Contrata a tu primer empleado',            rarity: 'common'    },
  { type: 'streak_3',     icon: '🔥', title: '3 días sin crisis',    desc: '3 días consecutivos sin hospitalizados',   rarity: 'common'    },
  { type: 'streak_7',     icon: '🔥', title: 'Semana perfecta',      desc: '7 días seguidos sin hospitalizados',       rarity: 'rare'      },
  { type: 'streak_30',    icon: '💎', title: 'Mes impecable',        desc: '30 días sin un solo hospitalizado',        rarity: 'legendary' },
  { type: 'happy_place',  icon: '😊', title: 'La alegría del barrio',desc: 'Ánimo medio de todos ≥ 80%',               rarity: 'rare'      },
  { type: 'full_house',   icon: '🏘️', title: 'Casa llena',          desc: '6 o más residentes en la residencia',      rarity: 'rare'      },
  { type: 'millionaire',  icon: '💰', title: 'El Millonario',        desc: 'Acumula 1.000.000€',                       rarity: 'epic'      },
  { type: 'level_5',      icon: '⭐', title: 'JR Experto',           desc: 'Alcanza el nivel 5',                       rarity: 'rare'      },
  { type: 'legend',       icon: '👑', title: 'Leyenda Viviente',     desc: 'Alcanza el nivel 10',                      rarity: 'legendary' },
  { type: 'perfect_rep',  icon: '🏆', title: 'Reputación perfecta',  desc: 'Llega a 100 de reputación',                rarity: 'epic'      },
  { type: 'inspector_a',  icon: '🔍', title: 'Inspección 10',       desc: 'Obtén nota A en una inspección sanitaria', rarity: 'epic'      },
]

const RARITY_COLOR: Record<string, string> = {
  common:    '#6b7280',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#f59e0b',
}

const RARITY_LABEL: Record<string, string> = {
  common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario',
}

export default function AchievementsPanel({ achievements, residence }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const unlocked = new Set(achievements.map(a => a.type))
  const unlockedCount = unlocked.size

  const selectedDef = selected ? ALL_ACHIEVEMENTS.find(a => a.type === selected) : null
  const isUnlocked = selected ? unlocked.has(selected) : false
  const unlockedAch = selected ? achievements.find(a => a.type === selected) : null

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Header */}
      <div className="card py-3 text-center">
        <p className="text-4xl mb-1">🏆</p>
        <p className="text-amber-300 font-bold">{unlockedCount} / {ALL_ACHIEVEMENTS.length} logros</p>
        <div className="w-full h-2 bg-amber-900/50 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      {/* Records */}
      <div className="card py-3">
        <p className="text-amber-500 font-bold text-xs uppercase tracking-wide mb-2">📊 Récords</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Racha actual',    value: `${residence.streak_days ?? 0}d 🔥`,    color: residence.streak_days >= 7 ? 'text-yellow-400' : 'text-amber-400' },
            { label: 'Mejor racha',     value: `${residence.best_streak ?? 0}d 🏅`,    color: 'text-amber-300' },
            { label: 'Urgencias res.', value: String(residence.total_events_resolved || 0), color: 'text-green-400' },
            { label: 'Reputación',     value: String(residence.reputation),             color: 'text-blue-400' },
          ].map(r => (
            <div key={r.label} className="bg-amber-900/20 rounded-xl px-3 py-2 text-center">
              <p className={`font-bold text-base ${r.color}`}>{r.value}</p>
              <p className="text-amber-700 text-[10px]">{r.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-3 gap-2">
        {ALL_ACHIEVEMENTS.map(ach => {
          const done = unlocked.has(ach.type)
          const rarityColor = RARITY_COLOR[ach.rarity]
          return (
            <button
              key={ach.type}
              onClick={() => setSelected(selected === ach.type ? null : ach.type)}
              className="card py-3 text-center transition-all active:scale-95"
              style={selected === ach.type ? { outline: `1px solid ${rarityColor}`, boxShadow: `0 0 8px ${rarityColor}44` } : undefined}
            >
              <div className={`text-2xl mb-1 ${done ? '' : 'grayscale opacity-30'}`}>
                {done ? ach.icon : '🔒'}
              </div>
              <p className={`text-[9px] font-semibold leading-tight ${done ? 'text-amber-300' : 'text-amber-800'}`}>
                {ach.title}
              </p>
              {done && (
                <div className="mt-1 h-0.5 rounded-full mx-auto w-6" style={{ background: rarityColor }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected detail */}
      {selectedDef && (
        <div className="card border animate-bounce-in" style={{ borderColor: RARITY_COLOR[selectedDef.rarity] + '60' }}>
          <div className="flex items-start gap-3">
            <span className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>{isUnlocked ? selectedDef.icon : '🔒'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-amber-200 font-bold text-sm">{selectedDef.title}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: RARITY_COLOR[selectedDef.rarity] + '30', color: RARITY_COLOR[selectedDef.rarity] }}>
                  {RARITY_LABEL[selectedDef.rarity]}
                </span>
              </div>
              <p className="text-amber-600 text-xs mt-0.5">{selectedDef.desc}</p>
              {isUnlocked && unlockedAch && (
                <p className="text-amber-700 text-[10px] mt-1">
                  Desbloqueado el {new Date(unlockedAch.unlocked_at).toLocaleDateString('es-ES')}
                </p>
              )}
              {!isUnlocked && (
                <p className="text-amber-800 text-[10px] mt-1">Aún por desbloquear</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
