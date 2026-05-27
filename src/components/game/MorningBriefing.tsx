'use client'
import { OvernightSummary } from '@/lib/types'

interface Props {
  summary: OvernightSummary
  residenceName: string
  onClose: () => void
}

export default function MorningBriefing({ summary, residenceName, onClose }: Props) {
  const income = summary?.income ?? 0
  const eventsCount = summary?.events ?? 0
  const escalated = summary?.escalated ?? 0
  const hospitalized = summary?.hospitalized ?? 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-amber-950 border border-amber-700/50 rounded-3xl overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-5 py-4">
          <p className="text-amber-400 text-xs font-semibold mb-0.5">☀️ {greeting}</p>
          <h2 className="text-amber-200 font-bold text-lg leading-tight">Turno de {hour < 14 ? 'mañana' : 'tarde'}</h2>
          <p className="text-amber-600 text-xs mt-0.5">{residenceName}</p>
        </div>

        {/* Briefing content */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-amber-500 text-sm font-semibold">Mientras no estabas:</p>

          <div className="grid grid-cols-2 gap-2">
            <BriefingCard
              icon="💰"
              value={`+${income.toLocaleString('es-ES')}€`}
              label="ingresado"
              color={income > 0 ? 'text-green-400' : 'text-amber-700'}
            />
            <BriefingCard
              icon="🚨"
              value={eventsCount.toString()}
              label={`urgencia${eventsCount !== 1 ? 's' : ''} pendiente${eventsCount !== 1 ? 's' : ''}`}
              color={eventsCount === 0 ? 'text-green-400' : eventsCount > 2 ? 'text-red-400' : 'text-orange-400'}
            />
            {escalated > 0 && (
              <BriefingCard
                icon="⬆️"
                value={escalated.toString()}
                label="escalada a crítico"
                color="text-orange-400"
              />
            )}
            {hospitalized > 0 && (
              <BriefingCard
                icon="🏥"
                value={hospitalized.toString()}
                label={`hospitalizado${hospitalized !== 1 ? 's' : ''}`}
                color="text-red-400 animate-pulse"
              />
            )}
          </div>

          {/* Narrative line */}
          <div className="bg-amber-900/30 rounded-xl px-4 py-3 border border-amber-800/30">
            <p className="text-amber-400 text-xs italic leading-relaxed">
              {hospitalized > 0
                ? `Ha sido una noche dura. ${hospitalized} residente${hospitalized > 1 ? 's' : ''} necesita atención médica urgente.`
                : eventsCount === 0
                ? 'Noche tranquila. Todos dormían cuando llegaste. El café está recién hecho.'
                : eventsCount <= 2
                ? 'Un par de incidencias, nada que JR no pueda gestionar. Buen turno.'
                : 'Noche movida. Manolo ha estado quejándose desde las 3 de la mañana. El de siempre.'}
            </p>
          </div>

          {eventsCount > 0 && (
            <p className="text-red-400 text-xs font-semibold text-center animate-pulse">
              🚨 Revisa las urgencias pendientes
            </p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-amber-600 text-amber-950 font-bold text-sm active:scale-95 transition-transform">
            Empezar turno
          </button>
        </div>
      </div>
    </div>
  )
}

function BriefingCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="bg-amber-900/30 rounded-xl p-3 text-center border border-amber-800/20">
      <p className="text-xl mb-0.5">{icon}</p>
      <p className={`font-bold text-base leading-none ${color}`}>{value}</p>
      <p className="text-amber-700 text-[10px] mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
