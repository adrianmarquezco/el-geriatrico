'use client'
import { Residence } from '@/lib/types'

interface Props {
  residence: Residence
}

const LEVELS: { lv: number; icon: string; title: string; unlocks: string[]; glow: string; color: string }[] = [
  { lv: 1,  icon: '🏠', title: 'Auxiliar Junior',   unlocks: ['Habitaciones', 'Comedor', 'Primeros residentes'],      glow: '96,165,250',  color: '#60a5fa' },
  { lv: 2,  icon: '📺', title: 'Auxiliar',           unlocks: ['Sala de TV', 'Jardín', 'Primeros empleados'],          glow: '167,139,250', color: '#a78bfa' },
  { lv: 3,  icon: '💊', title: 'Auxiliar Senior',    unlocks: ['Enfermería', 'Peluquería', 'Visitas familiares'],       glow: '244,114,182', color: '#f472b6' },
  { lv: 4,  icon: '⛪', title: 'Coordinador',        unlocks: ['Capilla', 'Sala de cartas', 'Misiones diarias'],        glow: '251,191,36',  color: '#fbbf24' },
  { lv: 5,  icon: '🤸', title: 'Coordinador Senior', unlocks: ['Fisioterapia', 'Personal élite', 'Eventos estacionales'],glow: '52,211,153',  color: '#34d399' },
  { lv: 6,  icon: '🏅', title: 'Director Adjunto',   unlocks: ['Mejoras Nv.3', 'Relaciones entre residentes', 'Historias'],glow: '251,146,60',color: '#fb923c' },
  { lv: 7,  icon: '⭐', title: 'Director',            unlocks: ['Crisis en cadena', 'Inspecciones extra', 'Bonos VIP'],  glow: '250,204,21',  color: '#facc15' },
  { lv: 8,  icon: '🌟', title: 'Director Estrella',  unlocks: ['Salas exclusivas', 'Staff especial', 'Turno nocturno'],  glow: '192,132,252', color: '#c084fc' },
  { lv: 9,  icon: '💎', title: 'Director Maestro',   unlocks: ['2ª planta', 'Eventos legendarios', 'Récords globales'],  glow: '103,232,249', color: '#67e8f9' },
  { lv: 10, icon: '👑', title: 'Leyenda Viviente',   unlocks: ['Título de Leyenda', 'Marco dorado', 'Grand Geriátrico'],  glow: '245,158,11',  color: '#f59e0b' },
]

export default function UnlockTree({ residence }: Props) {
  const currentLevel = residence.level
  const xpNeeded  = currentLevel * 200
  const xpProgress = Math.min(100, (residence.jr_experience % xpNeeded) / xpNeeded * 100)
  const xpLeft    = xpNeeded - (residence.jr_experience % xpNeeded)
  const current   = LEVELS[Math.min(currentLevel - 1, 9)]

  return (
    <div className="flex flex-col gap-3 pb-4">

      {/* Current level card */}
      <div className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg,rgba(${current.glow},0.18) 0%,rgba(9,11,20,0.98) 100%)`,
          border: `1px solid rgba(${current.glow},0.4)`,
          boxShadow: `0 0 24px rgba(${current.glow},0.12)`,
        }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: `rgba(${current.glow},0.2)`, border: `1px solid rgba(${current.glow},0.4)` }}>
            {current.icon}
          </div>
          <div className="flex-1">
            <p className="font-black text-slate-200 text-base leading-tight">{current.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: `rgba(${current.glow},0.8)` }}>
              Nivel {currentLevel} · {xpLeft} XP para subir
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg,rgba(${current.glow},0.7),${current.color})` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: `rgba(${current.glow},0.5)` }}>Nv.{currentLevel}</span>
          <span className="text-[10px] font-black" style={{ color: current.color }}>{Math.round(xpProgress)}%</span>
          <span className="text-[10px]" style={{ color: `rgba(${current.glow},0.5)` }}>Nv.{currentLevel + 1}</span>
        </div>
      </div>

      {/* Tree */}
      <div className="flex flex-col">
        {LEVELS.map((lv, i) => {
          const isUnlocked = currentLevel >= lv.lv
          const isCurrent  = currentLevel === lv.lv
          const isNext     = currentLevel + 1 === lv.lv

          return (
            <div key={lv.lv} className="relative flex gap-3">
              {/* Vertical connector */}
              <div className="flex flex-col items-center" style={{ width: 40, flexShrink: 0 }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 z-10 transition-all"
                  style={{
                    background: isUnlocked ? `rgba(${lv.glow},0.2)` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isUnlocked ? `rgba(${lv.glow},0.45)` : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isCurrent ? `0 0 12px rgba(${lv.glow},0.5)` : 'none',
                  }}>
                  {isUnlocked
                    ? <span className={isCurrent ? 'animate-pulse' : ''}>{lv.icon}</span>
                    : <span className="text-slate-700 text-xs font-black">{lv.lv}</span>
                  }
                </div>
                {i < LEVELS.length - 1 && (
                  <div className="flex-1 w-0.5 my-0.5"
                    style={{ background: isUnlocked && currentLevel > lv.lv ? `rgba(${lv.glow},0.35)` : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 mb-2 rounded-2xl p-3 transition-all ${isUnlocked ? '' : 'opacity-40'}`}
                style={{
                  background: isCurrent
                    ? `linear-gradient(135deg,rgba(${lv.glow},0.1) 0%,rgba(9,11,20,0.97) 100%)`
                    : 'rgba(9,11,20,0.5)',
                  border: `1px solid ${isCurrent ? `rgba(${lv.glow},0.35)` : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-sm" style={{ color: isUnlocked ? '#e2e8f0' : '#374151' }}>
                    Nv.{lv.lv} — {lv.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `rgba(${lv.glow},0.2)`, color: lv.color }}>ACTUAL</span>
                  )}
                  {isNext && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>PRÓXIMO</span>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span className="text-[9px]" style={{ color: `rgba(${lv.glow},0.6)` }}>✓</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {lv.unlocks.map(u => (
                    <span key={u} className="text-[10px] px-2 py-0.5 rounded-lg"
                      style={{
                        background: isUnlocked ? `rgba(${lv.glow},0.12)` : 'rgba(255,255,255,0.03)',
                        color: isUnlocked ? lv.color : '#374151',
                        border: `1px solid ${isUnlocked ? `rgba(${lv.glow},0.2)` : 'rgba(255,255,255,0.04)'}`,
                      }}>
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
