'use client'

const NEED_ICONS: Record<string, string> = {
  hunger: '🍽️',
  hygiene: '🚿',
  medication: '💊',
  entertainment: '📺',
  companionship: '🤝',
}

const MOOD_COLOR: Record<string, string> = {
  feliz: 'text-green-400',
  normal: 'text-amber-400',
  enfadado: 'text-orange-400',
  furioso: 'text-red-400',
}

interface Props {
  residents: any[]
  residenceId: string
  detailed?: boolean
}

export default function ResidentsPanel({ residents, residenceId, detailed }: Props) {
  if (residents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🛏️</div>
        <p className="text-amber-500">No hay residentes aún.</p>
        <p className="text-amber-700 text-sm mt-1">Ve a Obras para preparar habitaciones.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-amber-400 font-semibold text-sm">
        {residents.length} {residents.length === 1 ? 'residente' : 'residentes'}
      </h2>

      {residents.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-amber-200">{r.name}, <span className="font-normal text-amber-500">{r.age} años</span></p>
              <p className="text-xs text-amber-600 mt-0.5 italic">"{r.tagline}"</p>
            </div>
            <span className={`text-sm font-semibold ${MOOD_COLOR[r.mood] || 'text-amber-400'}`}>
              {r.mood === 'feliz' ? '😊' : r.mood === 'enfadado' ? '😠' : r.mood === 'furioso' ? '🤬' : '😐'}
            </span>
          </div>

          {/* Needs bars */}
          <div className="flex flex-col gap-1.5">
            {(['hunger', 'hygiene', 'medication', 'entertainment', 'companionship'] as const).map(need => (
              <div key={need} className="flex items-center gap-2">
                <span className="text-sm w-5">{NEED_ICONS[need]}</span>
                <div className="flex-1 h-1.5 bg-amber-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r[need] < 30 ? 'bg-red-500' : r[need] < 60 ? 'bg-orange-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${r[need]}%` }}
                  />
                </div>
                <span className="text-xs text-amber-700 w-6 text-right">{r[need]}</span>
              </div>
            ))}
          </div>

          {detailed && r.backstory && (
            <p className="text-xs text-amber-600 mt-3 pt-3 border-t border-amber-800/50 italic">
              {r.backstory}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
