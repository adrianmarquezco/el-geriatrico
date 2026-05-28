'use client'
import { useState } from 'react'
import { DailyMission } from '@/lib/types'

interface Props {
  missions: DailyMission[]
  onClaim: (missionId: string) => Promise<void>
}

export default function MissionsWidget({ missions, onClaim }: Props) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const pendingClaims = missions.filter(m => m.completed_at && !m.claimed_at).length
  const totalDone     = missions.filter(m => m.completed_at).length

  async function handleClaim(id: string) {
    setClaiming(id)
    await onClaim(id)
    setClaiming(null)
  }

  if (missions.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(9,11,20,0.95)',
        border: pendingClaims > 0 ? '1px solid rgba(234,179,8,0.45)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: pendingClaims > 0 ? '0 0 18px rgba(234,179,8,0.12)' : 'none',
      }}>

      {/* Header */}
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
          🎯
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-black text-sm">Misiones del día</span>
            {pendingClaims > 0 && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce"
                style={{ background: 'rgba(234,179,8,0.25)', color: '#fde047', border: '1px solid rgba(234,179,8,0.4)' }}>
                {pendingClaims} listas
              </span>
            )}
          </div>
          {/* Progress dots */}
          <div className="flex gap-1 mt-1">
            {missions.map((m, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: m.claimed_at ? '#4ade80' : m.completed_at ? '#fde047' : 'rgba(255,255,255,0.12)' }} />
            ))}
            <span className="text-[9px] text-slate-600 ml-1">{totalDone}/{missions.length}</span>
          </div>
        </div>
        <span className="text-slate-600 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t px-3 pb-3 flex flex-col gap-2 pt-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {missions.map(m => {
            const isDone    = !!m.completed_at
            const isClaimed = !!m.claimed_at
            const progress  = Math.min(1, m.current_count / m.target_count)

            return (
              <div key={m.id} className="relative rounded-xl overflow-hidden"
                style={{
                  background: isClaimed ? 'rgba(34,197,94,0.06)' : isDone ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isClaimed ? '1px solid rgba(34,197,94,0.2)' : isDone ? '1px solid rgba(234,179,8,0.35)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                {/* Progress fill behind content */}
                {!isClaimed && !isDone && (
                  <div className="absolute inset-y-0 left-0 pointer-events-none"
                    style={{ width: `${progress * 100}%`, background: 'rgba(255,255,255,0.03)', transition: 'width 0.7s ease' }} />
                )}
                <div className="relative flex items-center gap-2.5 p-2.5">
                  <span className="text-xl leading-none shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight"
                      style={{ color: isClaimed ? '#4ade80' : isDone ? '#fde047' : '#cbd5e1' }}>
                      {m.description}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">+{m.reward_money}€ · +{m.reward_xp} XP</p>
                  </div>
                  {isClaimed ? (
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                      style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>✓</div>
                  ) : isDone ? (
                    <button onClick={() => handleClaim(m.id)} disabled={claiming === m.id}
                      className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black active:scale-95 transition-all disabled:opacity-50 animate-pulse"
                      style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.5)', color: '#fde047' }}>
                      {claiming === m.id ? '⏳' : '¡Cobrar!'}
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] font-black text-slate-500 tabular-nums">
                      {m.current_count}/{m.target_count}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
