'use client'
import { Residence } from '@/lib/types'

interface Props {
  residence: Residence
}

const LEVELS: { lv: number; icon: string; title: string; unlocks: string[] }[] = [
  { lv: 1,  icon: '🏠', title: 'Auxiliar Junior',     unlocks: ['Habitaciones básicas', 'Comedor', 'Primeros residentes'] },
  { lv: 2,  icon: '📺', title: 'Auxiliar',             unlocks: ['Sala de TV', 'Jardín', 'Primeros empleados'] },
  { lv: 3,  icon: '💊', title: 'Auxiliar Senior',      unlocks: ['Enfermería', 'Peluquería', 'Eventos familiares'] },
  { lv: 4,  icon: '⛪', title: 'Coordinador',          unlocks: ['Capilla', 'Sala de cartas', 'Misiones diarias'] },
  { lv: 5,  icon: '🤸', title: 'Coordinador Senior',   unlocks: ['Fisioterapia', 'Personal élite', 'Eventos estacionales'] },
  { lv: 6,  icon: '🏅', title: 'Director Adjunto',     unlocks: ['Mejoras de nivel 3', 'Relaciones entre residentes', 'Historias especiales'] },
  { lv: 7,  icon: '⭐', title: 'Director',              unlocks: ['Eventos crisis en cadena', 'Inspecciones extra', 'Bonificaciones VIP'] },
  { lv: 8,  icon: '🌟', title: 'Director Estrella',    unlocks: ['Nuevas salas exclusivas', 'Empleados especiales', 'Modo turno de noche'] },
  { lv: 9,  icon: '💎', title: 'Director Maestro',     unlocks: ['2ª planta desbloqueada', 'Eventos legendarios', 'Récords globales'] },
  { lv: 10, icon: '👑', title: 'Leyenda Viviente',     unlocks: ['Título de Leyenda', 'Marco dorado en perfil', 'Modo Grand Geriátrico'] },
]

export default function UnlockTree({ residence }: Props) {
  const currentLevel = residence.level
  const xpNeeded = currentLevel * 200
  const xpProgress = Math.min(100, (residence.jr_experience % xpNeeded) / xpNeeded * 100)
  const xpLeft = xpNeeded - (residence.jr_experience % xpNeeded)

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Current progress */}
      <div className="card py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{LEVELS[Math.min(currentLevel - 1, 9)].icon}</span>
          <div className="flex-1">
            <p className="text-amber-300 font-bold">{LEVELS[Math.min(currentLevel - 1, 9)].title}</p>
            <p className="text-amber-600 text-xs">Nivel {currentLevel} · {xpLeft} XP para subir</p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-amber-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-amber-700 text-[10px]">Nv.{currentLevel}</span>
          <span className="text-amber-700 text-[10px]">{Math.round(xpProgress)}%</span>
          <span className="text-amber-700 text-[10px]">Nv.{currentLevel + 1}</span>
        </div>
      </div>

      {/* Level tree */}
      <div className="flex flex-col gap-2">
        {LEVELS.map((lv, i) => {
          const isUnlocked = currentLevel >= lv.lv
          const isCurrent = currentLevel === lv.lv
          const isNext = currentLevel + 1 === lv.lv

          return (
            <div key={lv.lv} className="relative">
              {/* Connector */}
              {i > 0 && (
                <div className={`absolute left-5 -top-2 w-0.5 h-2 ${isUnlocked ? 'bg-amber-600' : 'bg-amber-900'}`} />
              )}

              <div className={`card flex items-start gap-3 transition-all ${
                isCurrent ? 'border-amber-500/60 bg-amber-900/30' :
                isNext ? 'border-amber-800/60' :
                isUnlocked ? 'border-green-800/40' :
                'opacity-50'
              }`}>
                {/* Level badge */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                  isUnlocked ? 'bg-amber-800/40 border-amber-600/50' :
                  isNext ? 'bg-amber-900/30 border-amber-800/40' :
                  'bg-amber-950 border-amber-900/30'
                }`}>
                  {isUnlocked ? lv.icon : <span className="text-amber-800 text-sm font-bold">{lv.lv}</span>}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${isUnlocked ? 'text-amber-200' : 'text-amber-700'}`}>
                      Nv.{lv.lv} — {lv.title}
                    </p>
                    {isCurrent && <span className="text-[9px] bg-amber-600/30 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">ACTUAL</span>}
                    {isNext && <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">PRÓXIMO</span>}
                    {isUnlocked && !isCurrent && <span className="text-[9px] text-green-600">✓</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lv.unlocks.map(u => (
                      <span key={u} className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isUnlocked ? 'bg-amber-900/40 text-amber-500' : 'bg-amber-950 text-amber-800'
                      }`}>{u}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
