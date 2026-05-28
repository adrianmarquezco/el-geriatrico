'use client'
import { useState } from 'react'
import { GameEvent, Resident } from '@/lib/types'

type SoundType = 'tap' | 'coin' | 'alarm' | 'success' | 'footstep' | 'levelup' | 'mission'

interface Props {
  event: GameEvent
  residents: Resident[]
  onResolve: (eventId: string, reputationDelta: number, moneyBonus: number) => void
  onClose: () => void
  play?: (s: SoundType) => void
}

function getGrade(avgHappiness: number, avgNeeds: number): {
  grade: string; label: string; color: string; bg: string;
  repDelta: number; moneyBonus: number; comment: string
} {
  if (avgHappiness >= 80 && avgNeeds >= 70) return {
    grade: 'A', label: 'Excelente', color: '#22c55e', bg: '#001a00',
    repDelta: 15, moneyBonus: 1000,
    comment: 'Instalaciones impecables. Esta residencia es un modelo a seguir.',
  }
  if (avgHappiness >= 60) return {
    grade: 'B', label: 'Notable', color: '#3b82f6', bg: '#00001a',
    repDelta: 5, moneyBonus: 300,
    comment: 'Buen nivel de atención con pequeñas áreas de mejora.',
  }
  if (avgHappiness >= 40) return {
    grade: 'C', label: 'Aceptable', color: '#f59e0b', bg: '#1a1000',
    repDelta: -5, moneyBonus: 0,
    comment: 'Hay deficiencias notables. Se recomienda plan de mejora.',
  }
  return {
    grade: 'D', label: 'Deficiente', color: '#ef4444', bg: '#1a0000',
    repDelta: -15, moneyBonus: 0,
    comment: 'Situación preocupante. Se abre expediente de seguimiento.',
  }
}

const CATEGORIES = [
  { key: 'hunger',       label: 'Alimentación', icon: '🍽️' },
  { key: 'hygiene',      label: 'Higiene',       icon: '🚿' },
  { key: 'medication',   label: 'Medicación',    icon: '💊' },
  { key: 'entertainment',label: 'Ocio',          icon: '📺' },
  { key: 'companionship',label: 'Bienestar',     icon: '❤️' },
]

export default function InspectionDialog({ event, residents, onResolve, onClose, play }: Props) {
  const [phase, setPhase] = useState<'intro' | 'results'>('intro')

  const avgHappiness = residents.length
    ? Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length)
    : 50

  const catScores = CATEGORIES.map(cat => ({
    ...cat,
    score: residents.length
      ? Math.round(residents.reduce((s, r) => s + (r[cat.key as keyof typeof r] as number ?? 0), 0) / residents.length)
      : 50,
  }))

  const avgNeeds = catScores.reduce((s, c) => s + c.score, 0) / catScores.length
  const result = getGrade(avgHappiness, avgNeeds)

  function gradeBar(score: number) {
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    return (
      <div className="flex-1 h-2 bg-amber-900/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md bg-amber-950 border-t-2 border-blue-600/60 rounded-t-3xl p-5 pb-8 animate-bounce-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🔍</div>
            <div>
              <p className="text-blue-300 font-bold text-sm">Inspección Sanitaria</p>
              <p className="text-amber-600 text-xs">El inspector ha llegado sin avisar</p>
            </div>
          </div>
          <div className="bg-blue-950/30 border border-blue-800/30 rounded-2xl px-4 py-3 mb-4">
            <p className="text-blue-200 text-sm font-semibold">
              "Buenos días. Soy el inspector Ramírez, de la Consejería de Sanidad. Vengo a evaluar las condiciones de la residencia."
            </p>
          </div>
          <p className="text-amber-600 text-xs text-center mb-4">
            Evaluará alimentación, higiene, medicación, ocio y bienestar
          </p>
          <button
            onClick={() => { play?.('tap'); setPhase('results') }}
            className="w-full py-3.5 rounded-2xl bg-blue-700 text-white font-bold text-sm active:scale-95 transition-transform"
          >
            Mostrar la residencia
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl p-5 pb-8 animate-bounce-in" style={{ background: result.bg, borderTop: `3px solid ${result.color}` }}>
        {/* Grade header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-3xl" style={{ borderColor: result.color, color: result.color, background: result.bg }}>
            {result.grade}
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: result.color }}>{result.label}</p>
            <p className="text-amber-500 text-xs">Ánimo medio: {avgHappiness}%</p>
          </div>
          {result.moneyBonus > 0 && (
            <div className="ml-auto text-right">
              <p className="text-green-400 font-bold">+{result.moneyBonus}€</p>
              <p className="text-green-600 text-[10px]">subvención</p>
            </div>
          )}
        </div>

        {/* Inspector comment */}
        <div className="rounded-xl px-4 py-3 mb-4 border" style={{ background: result.bg, borderColor: result.color + '40' }}>
          <p className="text-xs italic" style={{ color: result.color + 'cc' }}>
            "{result.comment}"
            <span className="not-italic text-amber-700"> — Inspector Ramírez</span>
          </p>
        </div>

        {/* Category scores */}
        <div className="flex flex-col gap-2 mb-4">
          {catScores.map(cat => (
            <div key={cat.key} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center shrink-0">{cat.icon}</span>
              <span className="text-amber-500 text-xs w-20 shrink-0">{cat.label}</span>
              {gradeBar(cat.score)}
              <span className="text-xs font-bold w-7 text-right shrink-0" style={{ color: cat.score >= 70 ? '#22c55e' : cat.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                {cat.score}%
              </span>
            </div>
          ))}
        </div>

        {result.repDelta < 0 && (
          <p className="text-red-400 text-xs text-center mb-3 animate-pulse">
            ⭐ {result.repDelta} reputación
          </p>
        )}
        {result.repDelta > 0 && (
          <p className="text-green-400 text-xs text-center mb-3">
            ⭐ +{result.repDelta} reputación
          </p>
        )}

        <button
          onClick={() => { play?.(result.grade === 'A' ? 'success' : result.repDelta < 0 ? 'alarm' : 'tap'); onResolve(event.id, result.repDelta, result.moneyBonus) }}
          className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
          style={{ background: result.color, color: '#fff' }}
        >
          Firmar informe y despedir al inspector
        </button>
      </div>
    </div>
  )
}
