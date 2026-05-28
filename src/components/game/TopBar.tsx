'use client'
import { useState, useEffect, useRef } from 'react'
import { Residence } from '@/lib/types'

interface Props {
  residence: Residence
  hasCritical?: boolean
  onSoundToggle?: () => boolean
}

function xpForNextLevel(level: number) { return level * 200 }

export default function TopBar({ residence, hasCritical, onSoundToggle }: Props) {
  const xpNeeded   = xpForNextLevel(residence.level)
  const xpProgress = Math.min(100, (residence.jr_experience % xpNeeded) / xpNeeded * 100)
  const [soundOn, setSoundOn]       = useState(true)
  const [moneyFlash, setMoneyFlash] = useState<'up' | 'down' | null>(null)
  const prevMoney = useRef(residence.money)
  const streak    = residence.streak_days ?? 0

  useEffect(() => {
    const stored = localStorage.getItem('geriatrico_sound')
    if (stored === 'off') setSoundOn(false)
  }, [])

  useEffect(() => {
    if (residence.money !== prevMoney.current) {
      setMoneyFlash(residence.money > prevMoney.current ? 'up' : 'down')
      prevMoney.current = residence.money
      const t = setTimeout(() => setMoneyFlash(null), 500)
      return () => clearTimeout(t)
    }
  }, [residence.money])

  function handleSound() {
    if (!onSoundToggle) return
    const next = onSoundToggle()
    setSoundOn(next)
    localStorage.setItem('geriatrico_sound', next ? 'on' : 'off')
  }

  const repColor = residence.reputation >= 80 ? '#fbbf24' : residence.reputation >= 50 ? '#60a5fa' : '#94a3b8'

  return (
    <header className="sticky top-0 z-10 px-4 py-2.5" style={{
      background: hasCritical ? 'rgba(12,5,5,0.97)' : 'rgba(7,8,14,0.97)',
      borderBottom: `1px solid ${hasCritical ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`,
      backdropFilter: 'blur(16px)',
      transition: 'background 0.8s, border-color 0.8s',
    }}>
      <div className="flex items-center justify-between mb-2">

        {/* Left: name + level badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Level badge */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(251,191,36,0.1))',
              border: '1px solid rgba(245,158,11,0.4)',
            }}>
            <span className="text-amber-400 font-black text-xs leading-none">Nv</span>
            <span className="text-amber-300 font-black text-sm leading-none">{residence.level}</span>
          </div>

          <div className="min-w-0">
            <h1 className="font-black text-slate-200 text-sm leading-none truncate">{residence.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {/* Reputation */}
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: repColor }}>⭐</span>
                <span className="text-[10px] font-bold" style={{ color: repColor }}>{residence.reputation}</span>
              </div>
              {streak > 0 && (
                <span className={`text-[10px] font-black ${streak >= 7 ? 'text-yellow-400' : streak >= 3 ? 'text-orange-400' : 'text-slate-600'}`}>
                  🔥{streak}d
                </span>
              )}
              {hasCritical && (
                <span className="text-[10px] font-black text-red-400 animate-pulse">🚨 CRÍTICO</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: money + sound */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)' }}>
            <span className="text-sm">💰</span>
            <span
              className={`text-green-400 font-black text-sm tabular-nums ${moneyFlash ? 'animate-money-pop' : ''}`}
              style={{ color: moneyFlash === 'down' ? '#f87171' : moneyFlash === 'up' ? '#4ade80' : '#4ade80' }}
              key={moneyFlash ?? 'stable'}>
              {residence.money.toLocaleString('es-ES')}€
            </span>
          </div>
          {onSoundToggle && (
            <button onClick={handleSound}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {soundOn ? '🔊' : '🔇'}
            </button>
          )}
        </div>
      </div>

      {/* Bars */}
      <div className="flex gap-3">
        {/* Energy */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[11px] shrink-0">⚡</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${residence.jr_energy}%`,
                background: residence.jr_energy >= 50
                  ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                  : 'linear-gradient(90deg,#f97316,#ef4444)',
              }} />
          </div>
          <span className="text-[9px] text-slate-600 tabular-nums shrink-0 w-5 text-right">{residence.jr_energy}</span>
        </div>
        {/* XP */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[11px] shrink-0">✨</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }} />
          </div>
          <span className="text-[9px] text-purple-500 shrink-0 tabular-nums">{Math.round(xpProgress)}%</span>
        </div>
      </div>
    </header>
  )
}
