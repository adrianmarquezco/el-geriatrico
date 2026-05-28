'use client'
import { useState } from 'react'
import { StaffMember } from '@/lib/types'

const STAFF_META = {
  nurse:       { icon: '👩‍⚕️', name: 'Enfermera',  desc: 'Gestiona medicación automáticamente. Reduce urgencias críticas.',  cost: 3000, salary: 60, effect: 'Medicación −20%', glow: '236,72,153',  border: '#ec4899' },
  cook:        { icon: '👨‍🍳', name: 'Cocinero',   desc: 'Alimenta a los residentes. Encarna seguirá quejándose igualmente.', cost: 2000, salary: 40, effect: 'Hambre −20%',     glow: '234,88,12',   border: '#f97316' },
  cleaner:     { icon: '🧹',  name: 'Limpiadora', desc: 'Mantiene la higiene. Imprescindible desde el tercer residente.',     cost: 1500, salary: 30, effect: 'Higiene −20%',    glow: '59,130,246',  border: '#3b82f6' },
  entertainer: { icon: '🎭',  name: 'Animador',   desc: 'Organiza actividades. Sebastián lo intenta muy fuerte.',             cost: 2500, salary: 45, effect: 'Ocio −15%',       glow: '168,85,247',  border: '#a855f7' },
} as const

interface Props {
  staff: StaffMember[]
  money: number
  onHire: (type: string) => Promise<boolean>
  onFire: (staffId: string) => Promise<void>
}

export default function StaffPanel({ staff, money, onHire, onFire }: Props) {
  const [hiring,  setHiring]  = useState<string | null>(null)
  const [firing,  setFiring]  = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const hiredTypes  = new Set(staff.map(s => s.type))
  const totalSalary = staff.reduce((s, m) => s + m.salary_per_hour, 0)

  async function handleHire(type: string) {
    setHiring(type); await onHire(type); setHiring(null)
  }
  async function handleFire(id: string) {
    if (confirm !== id) { setConfirm(id); return }
    setConfirm(null); setFiring(id); await onFire(id); setFiring(null)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-200 font-black text-base">Personal</h2>
          <p className="text-slate-600 text-xs mt-0.5">{staff.length} en plantilla · {totalSalary}€/h</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="text-sm">💰</span>
          <span className="text-green-400 font-black text-sm">{money.toLocaleString('es-ES')}€</span>
        </div>
      </div>

      {/* Hired staff */}
      {staff.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">En plantilla</p>
          {staff.map(s => {
            const meta = STAFF_META[s.type as keyof typeof STAFF_META]
            if (!meta) return null
            const isConfirm = confirm === s.id
            return (
              <div key={s.id} className="relative overflow-hidden rounded-2xl p-3"
                style={{
                  background: `linear-gradient(135deg,rgba(${meta.glow},0.1) 0%,rgba(9,11,20,0.97) 100%)`,
                  border: `1px solid rgba(${meta.glow},0.3)`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `rgba(${meta.glow},0.18)`, border: `1px solid rgba(${meta.glow},0.3)` }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-200 text-sm leading-tight">{s.name}</p>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: `rgba(${meta.glow},0.2)`, color: meta.border }}>
                        Nv.{s.level}
                      </span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: `rgba(${meta.glow},0.7)` }}>
                      {meta.effect} · {s.salary_per_hour}€/h
                    </p>
                  </div>
                  <button
                    onClick={() => handleFire(s.id)}
                    disabled={firing === s.id}
                    className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-black active:scale-95 transition-all ${isConfirm ? 'animate-pulse' : ''}`}
                    style={{
                      background: isConfirm ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isConfirm ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: isConfirm ? '#fca5a5' : '#475569',
                    }}>
                    {firing === s.id ? '⏳' : isConfirm ? '¿Seguro?' : 'Despedir'}
                  </button>
                </div>
              </div>
            )
          })}
          {totalSalary > 0 && (
            <p className="text-slate-700 text-[10px] text-right px-1">
              Coste diario: {(totalSalary * 24).toLocaleString('es-ES')}€
            </p>
          )}
        </div>
      )}

      {/* Hire new */}
      <div className="flex flex-col gap-2">
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Contratar</p>
        {(Object.entries(STAFF_META) as [keyof typeof STAFF_META, typeof STAFF_META[keyof typeof STAFF_META]][]).map(([type, meta]) => {
          const isHired   = hiredTypes.has(type)
          const canAfford = money >= meta.cost
          const isHiring  = hiring === type
          return (
            <div key={type}
              className={`relative overflow-hidden rounded-2xl p-3 transition-all ${isHired ? 'opacity-30' : ''}`}
              style={{
                background: isHired ? 'rgba(9,11,20,0.5)' : canAfford
                  ? `linear-gradient(135deg,rgba(${meta.glow},0.07) 0%,rgba(9,11,20,0.98) 100%)`
                  : 'rgba(9,11,20,0.5)',
                border: `1px solid ${isHired ? 'rgba(255,255,255,0.05)' : canAfford ? `rgba(${meta.glow},0.25)` : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: isHired ? 'rgba(255,255,255,0.04)' : `rgba(${meta.glow},0.12)`,
                    border: `1px solid ${isHired ? 'rgba(255,255,255,0.06)' : `rgba(${meta.glow},0.25)`}`,
                    filter: !canAfford && !isHired ? 'grayscale(60%)' : 'none',
                  }}>
                  {isHired ? '✅' : meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm" style={{ color: isHired ? '#475569' : '#e2e8f0' }}>{meta.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: isHired ? 'rgba(255,255,255,0.04)' : `rgba(${meta.glow},0.15)`, color: isHired ? '#475569' : meta.border }}>
                      {meta.effect}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{meta.desc}</p>
                </div>
                {!isHired && (
                  <button
                    onClick={() => handleHire(type)}
                    disabled={!canAfford || isHiring}
                    className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all disabled:opacity-40"
                    style={{
                      background: canAfford ? `rgba(${meta.glow},0.18)` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${canAfford ? `rgba(${meta.glow},0.5)` : 'rgba(255,255,255,0.07)'}`,
                      color: canAfford ? meta.border : '#475569',
                    }}>
                    <span className="text-base leading-none">{isHiring ? '⏳' : canAfford ? '🤝' : '🔒'}</span>
                    <span>{isHiring ? '...' : `${meta.cost.toLocaleString('es-ES')}€`}</span>
                    <span className="opacity-60">{meta.salary}€/h</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
