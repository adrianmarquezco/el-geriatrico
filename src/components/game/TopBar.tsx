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

  // Restore from localStorage
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
    <header className="sticky top-0 z-10 bg-amber-950/95 backdrop-blur border-b border-amber-800/50 px-4 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <h1 className="font-bold text-amber-300 text-sm leading-none">{residence.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-amber-600 text-[10px]">JR Nv.{residence.level}</span>
            <span className="text-amber-800 text-[10px]">·</span>
            <span className="text-amber-700 text-[10px]">⭐{residence.reputation}</span>
            {(residence.streak_days ?? 0) > 0 && (
              <>
                <span className="text-amber-800 text-[10px]">·</span>
                <span className={`text-[10px] font-bold ${(residence.streak_days ?? 0) >= 7 ? 'text-yellow-400' : (residence.streak_days ?? 0) >= 3 ? 'text-orange-400' : 'text-amber-600'}`}>
                  🔥{residence.streak_days}d
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-sm">💰 {residence.money.toLocaleString('es-ES')}€</span>
          {onSoundToggle && (
            <button onClick={handleSound} className="text-amber-700 hover:text-amber-400 transition-colors text-base" title={soundOn ? 'Silenciar' : 'Activar sonido'}>
              {soundOn ? '🔊' : '🔇'}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[10px] text-amber-600">⚡</span>
          <div className="flex-1 h-1.5 bg-amber-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${residence.jr_energy}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[10px] text-purple-600">🧠</span>
          <div className="flex-1 h-1.5 bg-purple-900/60 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="text-[9px] text-purple-700 whitespace-nowrap">Nv.{residence.level+1}</span>
        </div>
      </div>
    </header>
  )
}
