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

  async function handleClaim(id: string) {
    setClaiming(id)
    await onClaim(id)
    setClaiming(null)
  }

  if (missions.length === 0) return null

  return (
    <div className="card border-amber-700/40">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-amber-300 font-semibold text-sm">Misiones del día</span>
          {pendingClaims > 0 && (
            <span className="bg-yellow-500 text-yellow-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {pendingClaims} listas
            </span>
          )}
        </div>
        <span className="text-amber-700 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 mt-3">
          {missions.map(m => {
            const isDone = !!m.completed_at
            const isClaimed = !!m.claimed_at
            const progress = Math.min(1, m.current_count / m.target_count)

            return (
              <div
                key={m.id}
                className={`rounded-xl p-2.5 border transition-all ${
                  isClaimed ? 'bg-green-950/30 border-green-900/40 opacity-60' :
                  isDone    ? 'bg-yellow-950/40 border-yellow-700/60' :
                              'bg-amber-950/40 border-amber-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${isClaimed ? 'text-green-500' : isDone ? 'text-yellow-300' : 'text-amber-300'}`}>
                      {m.description}
                    </p>
                    <p className="text-amber-700 text-[10px] mt-0.5">
                      +{m.reward_money}€ · +{m.reward_xp} XP
                    </p>
                  </div>
                  {isClaimed ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : isDone ? (
                    <button
                      onClick={() => handleClaim(m.id)}
                      disabled={claiming === m.id}
                      className="btn-primary text-[11px] px-2 py-1 animate-pulse"
                    >
                      {claiming === m.id ? '...' : '¡Cobrar!'}
                    </button>
                  ) : (
                    <span className="text-amber-700 text-[10px] shrink-0">
                      {m.current_count}/{m.target_count}
                    </span>
                  )}
                </div>
                {!isClaimed && !isDone && (
                  <div className="mt-1.5 bg-amber-900/50 rounded-full h-1">
                    <div
                      className="bg-amber-500 h-1 rounded-full transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
