'use client'
import { Resident } from '@/lib/types'

const NEED_ICONS: Record<string, string> = {
  hunger: '🍽️', hygiene: '🚿', medication: '💊', entertainment: '📺', companionship: '🤝',
}
const NEED_LABELS: Record<string, string> = {
  hunger: 'Hambre', hygiene: 'Higiene', medication: 'Medicación', entertainment: 'Ocio', companionship: 'Compañía',
}
const MOOD_ICON: Record<string, string> = {
  feliz: '😊', normal: '😐', enfadado: '😠', furioso: '🤬',
}

interface Props {
  residents: Resident[]
}

export default function ResidentsPanel({ residents }: Props) {
  if (residents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🛏️</div>
        <p className="text-amber-500 font-medium">Sin residentes aún.</p>
        <p className="text-amber-700 text-sm mt-1">Construye habitaciones en Obras.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-amber-400 font-semibold text-sm">
        {residents.length} {residents.length === 1 ? 'residente' : 'residentes'}
      </h2>

      {residents.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <p className="font-bold text-amber-200">{r.name}, <span className="font-normal text-amber-500 text-sm">{r.age} años</span></p>
                <span className="text-lg">{MOOD_ICON[r.mood] || '😐'}</span>
              </div>
              <p className="text-xs text-amber-600 mt-0.5 italic">"{r.tagline}"</p>
            </div>
            <div className="shrink-0">
              <div className={`badge ${r.happiness >= 70 ? 'bg-green-900 text-green-400' : r.happiness >= 40 ? 'bg-amber-900 text-amber-400' : 'bg-red-900 text-red-400'}`}>
                {r.happiness}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {(['hunger','hygiene','medication','entertainment','companionship'] as const).map(need => (
              <div key={need} className="flex items-center gap-2">
                <span className="text-sm w-5 shrink-0">{NEED_ICONS[need]}</span>
                <span className="text-xs text-amber-700 w-16 shrink-0">{NEED_LABELS[need]}</span>
                <div className="flex-1 h-1.5 bg-amber-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      r[need] < 25 ? 'bg-red-500' : r[need] < 50 ? 'bg-orange-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${r[need]}%` }}
                  />
                </div>
                <span className={`text-xs w-6 text-right font-medium ${r[need] < 25 ? 'text-red-400' : 'text-amber-700'}`}>{r[need]}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-900/40">
            <span className="text-[10px] text-amber-700">📍</span>
            <span className="text-[10px] text-amber-600 italic">{r.activity || 'descansando'}</span>
          </div>

          {r.backstory && (
            <p className="text-xs text-amber-700 mt-2 italic leading-relaxed">
              {r.backstory}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
