'use client'
import { useState } from 'react'
import { Achievement, Residence } from '@/lib/types'

interface Props {
  achievements: Achievement[]
  residence: Residence
}

const ALL_ACHIEVEMENTS: { type: string; icon: string; title: string; desc: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }[] = [
  { type: 'first_event',  icon: '🎯', title: 'Primera urgencia',     desc: 'Resuelve tu primera urgencia',             rarity: 'common'    },
  { type: 'first_staff',  icon: '👩‍⚕️', title: 'El primer fichaje',   desc: 'Contrata a tu primer empleado',            rarity: 'common'    },
  { type: 'streak_3',     icon: '🔥', title: '3 días sin crisis',     desc: '3 días consecutivos sin hospitalizados',   rarity: 'common'    },
  { type: 'streak_7',     icon: '🔥', title: 'Semana perfecta',       desc: '7 días seguidos sin hospitalizados',       rarity: 'rare'      },
  { type: 'streak_30',    icon: '💎', title: 'Mes impecable',         desc: '30 días sin un solo hospitalizado',        rarity: 'legendary' },
  { type: 'happy_place',  icon: '😊', title: 'La alegría del barrio', desc: 'Ánimo medio de todos ≥ 80%',               rarity: 'rare'      },
  { type: 'full_house',   icon: '🏘️', title: 'Casa llena',           desc: '6 o más residentes en la residencia',      rarity: 'rare'      },
  { type: 'millionaire',  icon: '💰', title: 'El Millonario',         desc: 'Acumula 1.000.000€',                       rarity: 'epic'      },
  { type: 'level_5',      icon: '⭐', title: 'JR Experto',            desc: 'Alcanza el nivel 5',                       rarity: 'rare'      },
  { type: 'legend',       icon: '👑', title: 'Leyenda Viviente',      desc: 'Alcanza el nivel 10',                      rarity: 'legendary' },
  { type: 'perfect_rep',  icon: '🏆', title: 'Reputación perfecta',   desc: 'Llega a 100 de reputación',                rarity: 'epic'      },
  { type: 'inspector_a',  icon: '🔍', title: 'Inspección 10',        desc: 'Obtén nota A en una inspección sanitaria', rarity: 'epic'      },
]

const RARITY: Record<string, { color: string; glow: string; label: string }> = {
  common:    { color: '#6b7280', glow: '107,114,128', label: 'Común'     },
  rare:      { color: '#3b82f6', glow: '59,130,246',  label: 'Raro'      },
  epic:      { color: '#a855f7', glow: '168,85,247',  label: 'Épico'     },
  legendary: { color: '#f59e0b', glow: '245,158,11',  label: 'Legendario'},
}

export default function AchievementsPanel({ achievements, residence }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const unlocked      = new Set(achievements.map(a => a.type))
  const unlockedCount = unlocked.size
  const pct           = (unlockedCount / ALL_ACHIEVEMENTS.length) * 100

  const selectedDef  = selected ? ALL_ACHIEVEMENTS.find(a => a.type === selected) : null
  const isUnlocked   = selected ? unlocked.has(selected) : false
  const unlockedAch  = selected ? achievements.find(a => a.type === selected) : null

  return (
    <div className="flex flex-col gap-3 pb-4">

      {/* Progress header */}
      <div className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(9,11,20,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-slate-200 font-black text-base">{unlockedCount} / {ALL_ACHIEVEMENTS.length} logros</p>
        <div className="w-full h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#8b5cf6,#f59e0b)' }} />
        </div>
        <p className="text-slate-600 text-[10px] mt-1">{Math.round(pct)}% completado</p>
      </div>

      {/* Records */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(9,11,20,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-2">Récords</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Racha actual',   value: `${residence.streak_days ?? 0}d`,  icon: '🔥', color: (residence.streak_days ?? 0) >= 7 ? '#fde047' : '#f97316' },
            { label: 'Mejor racha',    value: `${residence.best_streak ?? 0}d`,   icon: '🏅', color: '#fbbf24' },
            { label: 'Urgencias res.', value: String(residence.total_events_resolved || 0), icon: '✅', color: '#4ade80' },
            { label: 'Reputación',     value: String(residence.reputation),        icon: '⭐', color: '#60a5fa' },
          ].map(r => (
            <div key={r.label} className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xl leading-none mb-1">{r.icon}</p>
              <p className="font-black text-sm" style={{ color: r.color }}>{r.value}</p>
              <p className="text-slate-600 text-[10px] mt-0.5">{r.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-3 gap-2">
        {ALL_ACHIEVEMENTS.map(ach => {
          const done     = unlocked.has(ach.type)
          const r        = RARITY[ach.rarity]
          const isSelected = selected === ach.type
          return (
            <button key={ach.type}
              onClick={() => setSelected(isSelected ? null : ach.type)}
              className="relative overflow-hidden rounded-2xl py-3 px-2 text-center active:scale-95 transition-all flex flex-col items-center"
              style={{
                background: done
                  ? `linear-gradient(135deg,rgba(${r.glow},0.12) 0%,rgba(9,11,20,0.97) 100%)`
                  : 'rgba(9,11,20,0.6)',
                border: isSelected
                  ? `1px solid ${r.color}`
                  : done
                  ? `1px solid rgba(${r.glow},0.3)`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isSelected ? `0 0 12px rgba(${r.glow},0.3)` : 'none',
              }}>
              {/* Rarity top bar */}
              {done && (
                <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-full"
                  style={{ background: `linear-gradient(90deg,transparent,${r.color},transparent)` }} />
              )}
              <div className={`text-2xl mb-1.5 ${done ? '' : 'grayscale opacity-25'}`}>
                {done ? ach.icon : '🔒'}
              </div>
              <p className="text-[9px] font-black leading-tight" style={{ color: done ? '#e2e8f0' : '#374151' }}>
                {ach.title}
              </p>
              {done && (
                <span className="text-[8px] mt-1 px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `rgba(${r.glow},0.2)`, color: r.color }}>
                  {r.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected detail */}
      {selectedDef && (
        <div className="animate-popup-in rounded-2xl p-4 overflow-hidden"
          style={{
            background: `linear-gradient(135deg,rgba(${RARITY[selectedDef.rarity].glow},0.12) 0%,rgba(9,11,20,0.98) 100%)`,
            border: `1px solid rgba(${RARITY[selectedDef.rarity].glow},0.4)`,
            boxShadow: `0 0 20px rgba(${RARITY[selectedDef.rarity].glow},0.12)`,
          }}>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{
                background: `rgba(${RARITY[selectedDef.rarity].glow},0.18)`,
                border: `1px solid rgba(${RARITY[selectedDef.rarity].glow},0.35)`,
                filter: isUnlocked ? 'none' : 'grayscale(80%)',
              }}>
              {isUnlocked ? selectedDef.icon : '🔒'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-slate-200 font-black text-sm">{selectedDef.title}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `rgba(${RARITY[selectedDef.rarity].glow},0.2)`, color: RARITY[selectedDef.rarity].color }}>
                  {RARITY[selectedDef.rarity].label}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{selectedDef.desc}</p>
              {isUnlocked && unlockedAch ? (
                <p className="text-[10px] mt-1.5" style={{ color: RARITY[selectedDef.rarity].color }}>
                  ✓ Desbloqueado el {new Date(unlockedAch.unlocked_at).toLocaleDateString('es-ES')}
                </p>
              ) : (
                <p className="text-slate-700 text-[10px] mt-1.5">Aún por desbloquear</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
