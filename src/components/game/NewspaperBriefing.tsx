'use client'
import { OvernightSummary } from '@/lib/types'

interface Props {
  summary: OvernightSummary
  residenceName: string
  streakDays: number
  onClose: () => void
}

function headline(s: OvernightSummary): { title: string; sub: string; mood: string } {
  const income = s?.income ?? 0
  const hosp = s?.hospitalized ?? 0
  const evs = s?.events ?? 0
  if (hosp > 0) return {
    title: `EMERGENCIA EN LA RESIDENCIA`,
    sub: `${hosp} residente${hosp > 1 ? 's' : ''} requirió atención médica urgente durante la noche`,
    mood: 'bad',
  }
  if (evs === 0 && income > 200) return {
    title: `NOCHE EJEMPLAR`,
    sub: `Sin incidencias y con ingresos récord. JR puede estar orgulloso`,
    mood: 'great',
  }
  if (evs <= 2) return {
    title: `NOCHE TRANQUILA`,
    sub: `Todo bajo control en la residencia. Los residentes durmieron bien`,
    mood: 'good',
  }
  return {
    title: `NOCHE MOVIDA`,
    sub: `Varios incidentes mantuvieron al personal alerta toda la noche`,
    mood: 'neutral',
  }
}

export default function NewspaperBriefing({ summary, residenceName, streakDays, onClose }: Props) {
  const income = summary?.income ?? 0
  const eventsCount = summary?.events ?? 0
  const escalated = summary?.escalated ?? 0
  const hospitalized = summary?.hospitalized ?? 0
  const { title, sub, mood } = headline(summary)
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  const moodColor = mood === 'bad' ? '#dc2626' : mood === 'great' ? '#16a34a' : mood === 'good' ? '#2563eb' : '#d97706'
  const moodBg = mood === 'bad' ? '#1a0000' : mood === 'great' ? '#001a00' : mood === 'good' ? '#00001a' : '#1a1000'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-3">
      <div className="w-full max-w-md animate-bounce-in" style={{ fontFamily: 'Georgia, serif' }}>

        {/* Newspaper header */}
        <div className="bg-amber-100 rounded-t-2xl px-4 pt-3 pb-2 border-b-4 border-amber-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-900/60 text-[9px] uppercase tracking-widest">Edición matutina</span>
            <span className="text-amber-900/60 text-[9px]">{today}</span>
          </div>
          <h1 className="text-center font-black text-amber-950 text-xl tracking-tight leading-none">
            EL GERIÁTRICO
          </h1>
          <p className="text-center text-amber-800/70 text-[9px] uppercase tracking-[0.2em]">{residenceName} · Boletín Interno</p>
          <div className="border-t border-b border-amber-900/30 mt-2 py-0.5 flex justify-center gap-4 text-[8px] text-amber-800/60 uppercase tracking-wider">
            <span>Noticias</span><span>·</span><span>Economía</span><span>·</span><span>Salud</span><span>·</span><span>Récords</span>
          </div>
        </div>

        {/* Main story */}
        <div className="px-4 py-3" style={{ background: moodBg, borderLeft: `4px solid ${moodColor}`, borderRight: `4px solid ${moodColor}` }}>
          <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: moodColor }}>
            {mood === 'bad' ? '⚠️ Urgente' : mood === 'great' ? '⭐ Destacado' : '📰 Crónica nocturna'}
          </p>
          <h2 className="font-black text-amber-100 text-lg leading-tight uppercase mb-1">{title}</h2>
          <p className="text-amber-300/80 text-xs leading-relaxed italic">"{sub}"</p>
        </div>

        {/* Stats grid */}
        <div className="bg-amber-950 grid grid-cols-3 border-x-4 border-amber-900" style={{ borderLeftColor: moodColor, borderRightColor: moodColor }}>
          <div className="text-center py-3 border-r border-amber-900/40">
            <p className="text-[8px] uppercase tracking-wide text-amber-700 mb-0.5">Ingresos noche</p>
            <p className={`font-black text-lg leading-none ${income > 0 ? 'text-green-400' : 'text-amber-700'}`}>
              +{income.toLocaleString('es-ES')}€
            </p>
          </div>
          <div className="text-center py-3 border-r border-amber-900/40">
            <p className="text-[8px] uppercase tracking-wide text-amber-700 mb-0.5">Urgencias</p>
            <p className={`font-black text-lg leading-none ${eventsCount === 0 ? 'text-green-400' : eventsCount > 3 ? 'text-red-400' : 'text-orange-400'}`}>
              {eventsCount}
            </p>
          </div>
          <div className="text-center py-3">
            <p className="text-[8px] uppercase tracking-wide text-amber-700 mb-0.5">Racha</p>
            <p className={`font-black text-lg leading-none ${streakDays >= 7 ? 'text-yellow-400' : streakDays >= 3 ? 'text-green-400' : 'text-amber-600'}`}>
              {streakDays}d 🔥
            </p>
          </div>
        </div>

        {/* Secondary stories */}
        <div className="bg-amber-950 px-4 py-3 border-x-4 border-b-4 border-amber-900 rounded-b-2xl flex flex-col gap-2" style={{ borderLeftColor: moodColor, borderRightColor: moodColor, borderBottomColor: moodColor }}>
          {escalated > 0 && (
            <div className="flex items-start gap-2 border-b border-amber-900/30 pb-2">
              <span className="text-orange-400 text-xs font-black shrink-0">⬆</span>
              <p className="text-amber-500 text-[10px] leading-relaxed">
                <span className="font-bold text-orange-400">{escalated} urgencia{escalated > 1 ? 's' : ''}</span> escalaron a nivel crítico durante la noche
              </p>
            </div>
          )}
          {hospitalized > 0 && (
            <div className="flex items-start gap-2 border-b border-amber-900/30 pb-2">
              <span className="text-red-400 text-xs font-black shrink-0">🏥</span>
              <p className="text-amber-500 text-[10px] leading-relaxed">
                <span className="font-bold text-red-400">{hospitalized} residente{hospitalized > 1 ? 's' : ''}</span> requirieron traslado al hospital. −500€ y −10 reputación
              </p>
            </div>
          )}
          {eventsCount === 0 && hospitalized === 0 && (
            <p className="text-amber-700 text-[10px] italic text-center">
              "Sin novedad en el frente. El café está recién hecho, JR."
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 mt-1"
            style={{ background: moodColor, color: '#fff' }}
          >
            Empezar turno →
          </button>
        </div>
      </div>
    </div>
  )
}
