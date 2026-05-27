'use client'
import { Resident } from '@/lib/types'

const MOOD_EMOJI: Record<string, string> = {
  feliz: '😊', normal: '😐', enfadado: '😠', furioso: '🤬',
}

const HAPPINESS_COLOR: Record<string, string> = {
  high:   'bg-green-500 ring-green-400',
  mid:    'bg-amber-500 ring-amber-400',
  low:    'bg-orange-500 ring-orange-400',
  danger: 'bg-red-500 ring-red-400',
}

function happinessLevel(h: number) {
  if (h >= 70) return 'high'
  if (h >= 40) return 'mid'
  if (h >= 20) return 'low'
  return 'danger'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

interface Props {
  resident: Resident
  hasEvent?: boolean
  isMoving?: boolean
  small?: boolean
}

export default function ResidentPin({ resident, hasEvent, isMoving, small }: Props) {
  const level = happinessLevel(resident.happiness)
  const colorClass = HAPPINESS_COLOR[level]
  const animClass = isMoving ? 'animate-walk' : 'animate-idle'
  const size = small ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative">
        <div className={`${size} ${colorClass} ring-2 rounded-full flex items-center justify-center font-bold text-white ${animClass} shadow-lg`}>
          {initials(resident.name)}
        </div>
        {hasEvent && (
          <span className="absolute -top-1 -right-1 text-xs animate-event">🔴</span>
        )}
      </div>
      {!small && (
        <div className="text-center">
          <p className="text-amber-300 text-[10px] font-semibold leading-none">{resident.name.split(' ')[0]}</p>
          <p className="text-amber-600 text-[9px] leading-none mt-0.5">{MOOD_EMOJI[resident.mood]}</p>
        </div>
      )}
    </div>
  )
}
