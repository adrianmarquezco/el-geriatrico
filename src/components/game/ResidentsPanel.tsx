'use client'
import { useState } from 'react'
import { Resident } from '@/lib/types'

const NEED_ICONS: Record<string, string>  = { hunger: '🍽️', hygiene: '🚿', medication: '💊', entertainment: '📺', companionship: '🤝' }
const NEED_LABELS: Record<string, string> = { hunger: 'Comida', hygiene: 'Higiene', medication: 'Medicación', entertainment: 'Ocio', companionship: 'Compañía' }
const NEED_COLOR = (v: number) => v >= 65 ? '#22c55e' : v >= 35 ? '#f97316' : '#ef4444'

const MOOD_ICON: Record<string, string> = { feliz: '😊', normal: '😐', enfadado: '😠', furioso: '🤬' }
const PERSONALITY_LABEL: Record<string, string> = {
  quejica: '😤 Quejica', cotilla: '🗣️ Cotilla', mandón: '👊 Mandón',
  devota: '🙏 Devota', sordo: '👂 Sordo', coqueta: '💃 Coqueta',
  misterioso: '🕵️ Misterioso', exigente: '🎩 Exigente', normal: '😊 Normal',
}

type CareAction = 'feed' | 'medicate' | 'chat' | 'shower' | 'entertain'
const CARE_ACTIONS: { id: CareAction; emoji: string; label: string; cost: string; color: string; borderColor: string; minMoney?: number; minEnergy?: number }[] = [
  { id: 'feed',      emoji: '🍽️', label: 'Alimentar', cost: '15€',   color: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', minMoney: 15  },
  { id: 'medicate',  emoji: '💊', label: 'Medicar',    cost: '25€',   color: 'rgba(236,72,153,0.15)', borderColor: 'rgba(236,72,153,0.4)', minMoney: 25  },
  { id: 'chat',      emoji: '💬', label: 'Charlar',    cost: '−10⚡', color: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)', minEnergy: 10 },
  { id: 'shower',    emoji: '🚿', label: 'Ducha',      cost: '10€',   color: 'rgba(34,197,94,0.15)',  borderColor: 'rgba(34,197,94,0.4)',  minMoney: 10  },
  { id: 'entertain', emoji: '📺', label: 'TV',         cost: '5€·5⚡',color: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.4)', minMoney: 5, minEnergy: 5 },
]

interface Props {
  residents: Resident[]
  money: number
  jrEnergy: number
  onCare: (residentId: string, action: CareAction) => Promise<void>
}

export default function ResidentsPanel({ residents, money, jrEnergy, onCare }: Props) {
  const [caring, setCaring] = useState<string | null>(null) // residentId:action

  if (residents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🛏️</div>
        <p className="text-slate-400 font-semibold text-base">Sin residentes aún</p>
        <p className="text-slate-600 text-sm mt-1">Construye habitaciones en Obras</p>
      </div>
    )
  }

  async function handleCare(residentId: string, action: CareAction) {
    const cfg = CARE_ACTIONS.find(a => a.id === action)
    if (cfg?.minMoney  && money    < cfg.minMoney)  return
    if (cfg?.minEnergy && jrEnergy < cfg.minEnergy) return
    const key = `${residentId}:${action}`
    setCaring(key)
    await onCare(residentId, action)
    setCaring(null)
  }

  const avgHappiness = Math.round(residents.reduce((s, r) => s + r.happiness, 0) / residents.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="card card-gold flex items-center gap-4 py-3">
        <div className="text-center flex-1">
          <p className="text-xl font-black text-amber-300">{residents.length}</p>
          <p className="text-slate-500 text-[10px]">residentes</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="text-center flex-1">
          <p className={`text-xl font-black ${avgHappiness >= 60 ? 'text-green-400' : avgHappiness >= 35 ? 'text-orange-400' : 'text-red-400'}`}>{avgHappiness}%</p>
          <p className="text-slate-500 text-[10px]">ánimo medio</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="text-center flex-1">
          <p className="text-xl font-black text-blue-400">{jrEnergy}⚡</p>
          <p className="text-slate-500 text-[10px]">energía JR</p>
        </div>
      </div>

      {residents.map(r => {
        const happColor = r.happiness >= 70 ? '#22c55e' : r.happiness >= 40 ? '#f59e0b' : '#ef4444'
        const urgent = (['hunger','hygiene','medication','entertainment','companionship'] as const).filter(n => r[n] < 25)
        return (
          <div key={r.id} className="card" style={{ borderColor: urgent.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.09)' }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${happColor}18`, border: `1px solid ${happColor}40` }}>
                  {MOOD_ICON[r.mood] || '😐'}
                </div>
                <div>
                  <p className="font-black text-slate-200 text-sm leading-tight">{r.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-slate-500 text-[10px]">{r.age} años</span>
                    <span className="text-slate-700 text-[10px]">·</span>
                    <span className="text-slate-500 text-[10px]">{PERSONALITY_LABEL[r.personality] || r.personality}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="px-2 py-0.5 rounded-full text-xs font-black" style={{ background: `${happColor}20`, color: happColor }}>
                  {r.happiness}%
                </div>
                {urgent.length > 0 && (
                  <p className="text-red-400 text-[9px] font-bold animate-pulse">{urgent.map(n => NEED_ICONS[n]).join(' ')} bajo</p>
                )}
              </div>
            </div>

            {/* Happiness bar */}
            <div className="w-full h-2 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${r.happiness}%`, background: `linear-gradient(90deg, ${happColor}aa, ${happColor})` }} />
            </div>

            {/* Needs */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {(['hunger','hygiene','medication','entertainment','companionship'] as const).map(need => {
                const val = r[need]
                const col = NEED_COLOR(val)
                return (
                  <div key={need} className="flex flex-col items-center gap-1">
                    <div className="relative w-full h-14 rounded-lg overflow-hidden flex flex-col-reverse"
                      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.07)` }}>
                      <div className="w-full transition-all duration-700 rounded-b-lg"
                        style={{ height: `${val}%`, background: `linear-gradient(to top, ${col}, ${col}88)` }} />
                    </div>
                    <span className="text-base leading-none">{NEED_ICONS[need]}</span>
                    <span className="text-[8px] font-bold" style={{ color: col }}>{val}</span>
                  </div>
                )
              })}
            </div>

            {/* Care actions — grid 3+2 */}
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-3 gap-1.5">
                {CARE_ACTIONS.slice(0,3).map(action => {
                  const key = `${r.id}:${action.id}`
                  const isLoading = caring === key
                  const disabled = isLoading
                    || (action.minMoney  !== undefined && money    < action.minMoney)
                    || (action.minEnergy !== undefined && jrEnergy < action.minEnergy)
                  return (
                    <button key={action.id} onClick={() => handleCare(r.id, action.id)} disabled={disabled}
                      className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[9px] font-bold transition-all active:scale-95 disabled:opacity-40"
                      style={{ background: action.color, border: `1px solid ${action.borderColor}`, color: '#e2e8f0' }}>
                      <span className="text-lg leading-none">{isLoading ? '⏳' : action.emoji}</span>
                      <span className="font-black">{action.label}</span>
                      <span className="text-[8px] opacity-60">{action.cost}</span>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CARE_ACTIONS.slice(3).map(action => {
                  const key = `${r.id}:${action.id}`
                  const isLoading = caring === key
                  const disabled = isLoading
                    || (action.minMoney  !== undefined && money    < action.minMoney)
                    || (action.minEnergy !== undefined && jrEnergy < action.minEnergy)
                  return (
                    <button key={action.id} onClick={() => handleCare(r.id, action.id)} disabled={disabled}
                      className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[9px] font-bold transition-all active:scale-95 disabled:opacity-40"
                      style={{ background: action.color, border: `1px solid ${action.borderColor}`, color: '#e2e8f0' }}>
                      <span className="text-lg leading-none">{isLoading ? '⏳' : action.emoji}</span>
                      <span className="font-black">{action.label}</span>
                      <span className="text-[8px] opacity-60">{action.cost}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Backstory / activity */}
            {(r.backstory || r.activity) && (
              <div className="mt-2.5 pt-2.5 border-t border-white/5">
                {r.activity && (
                  <p className="text-[10px] text-slate-600 italic mb-1">📍 {r.activity}</p>
                )}
                {r.backstory && (
                  <p className="text-[10px] text-slate-600 leading-relaxed italic">{r.backstory}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
