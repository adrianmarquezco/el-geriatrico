'use client'
import { useState, useEffect } from 'react'
import { Residence } from '@/lib/types'

interface Props {
  residence: Residence
  onSoundToggle?: () => boolean
}

function xpForNextLevel(level: number) { return level * 200 }

export default function TopBar({ residence, onSoundToggle }: Props) {
  const xpNeeded = xpForNextLevel(residence.level)
  const xpProgress = Math.min(100, (residence.jr_experience % xpNeeded) / xpNeeded * 100)
  const [soundOn, setSoundOn] = useState(true)
  const streak = residence.streak_days ?? 0

  useEffect(() => {
    const stored = localStorage.getItem('geriatrico_sound')
    if (stored === 'off') setSoundOn(false)
  }, [])

  function handleSound() {
    if (!onSoundToggle) return
    const next = onSoundToggle()
    setSoundOn(next)
    localStorage.setItem('geriatrico_sound', next ? 'on' : 'off')
  }

  return (
    <header className="sticky top-0 z-10 px-4 py-2.5" style={{
      background: 'rgba(7,8,14,0.96)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="flex items-center justify-between mb-2">
        {/* Left: name + level + streak */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h1 className="font-black text-slate-200 text-sm leading-none truncate">{residence.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-amber-400">JR Nv.{residence.level}</span>
              <span className="text-slate-700 text-[10px]">·</span>
              <span className="text-[10px] text-blue-400 font-semibold">⭐ {residence.reputation}</span>
              {streak > 0 && (
                <>
                  <span className="text-slate-700 text-[10px]">·</span>
                  <span className={`text-[10px] font-black ${streak >= 7 ? 'text-yellow-400' : streak >= 3 ? 'text-orange-400' : 'text-slate-500'}`}>
                    🔥{streak}d
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: money + sound */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <span className="text-sm">💰</span>
            <span className="text-green-400 font-black text-sm">{residence.money.toLocaleString('es-ES')}€</span>
          </div>
          {onSoundToggle && (
            <button onClick={handleSound}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              {soundOn ? '🔊' : '🔇'}
            </button>
          )}
        </div>
      </div>

      {/* Bars row */}
      <div className="flex gap-2">
        {/* Energy */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[10px] shrink-0">⚡</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${residence.jr_energy}%`,
                background: residence.jr_energy >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#f97316,#ef4444)',
              }} />
          </div>
          <span className="text-[9px] text-slate-600 shrink-0 w-6 text-right">{residence.jr_energy}</span>
        </div>
        {/* XP */}
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[10px] shrink-0">🧠</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' }} />
          </div>
          <span className="text-[9px] text-slate-600 shrink-0">Nv.{residence.level + 1}</span>
        </div>
      </div>
    </header>
  )
}
