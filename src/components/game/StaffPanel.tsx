'use client'
import { useState } from 'react'
import { StaffMember } from '@/lib/types'

const STAFF_META = {
  nurse:       { icon: '👩‍⚕️', name: 'Enfermera',   desc: 'Gestiona medicación automáticamente. Reduce urgencias críticas.', cost: 3000, salary: 60, effect: 'Medicación −20%/nivel' },
  cook:        { icon: '👨‍🍳', name: 'Cocinero',    desc: 'Alimenta a los residentes. Encarna seguirá quejándose igualmente.', cost: 2000, salary: 40, effect: 'Hambre −20%/nivel' },
  cleaner:     { icon: '🧹', name: 'Limpiadora',  desc: 'Mantiene la higiene. Imprescindible desde el tercer residente.', cost: 1500, salary: 30, effect: 'Higiene −20%/nivel' },
  entertainer: { icon: '🎭', name: 'Animador',    desc: 'Organiza actividades. Sebastián lo intenta muy fuerte.', cost: 2500, salary: 45, effect: 'Entretenimiento −15%/nivel' },
} as const

interface Props {
  staff: StaffMember[]
  money: number
  onHire: (type: string) => Promise<boolean>
  onFire: (staffId: string) => Promise<void>
}

export default function StaffPanel({ staff, money, onHire, onFire }: Props) {
  const [hiring, setHiring] = useState<string | null>(null)
  const [firing, setFiring] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  const hiredTypes = new Set(staff.map(s => s.type))
  const totalSalary = staff.reduce((s, m) => s + m.salary_per_hour, 0)

  async function handleHire(type: string) {
    setHiring(type)
    await onHire(type)
    setHiring(null)
  }

  async function handleFire(id: string) {
    if (confirm !== id) { setConfirm(id); return }
    setConfirm(null)
    setFiring(id)
    await onFire(id)
    setFiring(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-amber-400 font-semibold text-sm">Personal del geriátrico</h2>
        <span className="text-green-400 font-bold text-sm">💰 {money.toLocaleString('es-ES')}€</span>
      </div>

      {staff.length > 0 && (
        <div className="card bg-amber-900/20">
          <p className="text-amber-600 text-xs font-semibold mb-2">En plantilla</p>
          <div className="flex flex-col gap-2">
            {staff.map(s => {
              const meta = STAFF_META[s.type]
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-200 text-sm font-semibold">{s.name} <span className="text-amber-600 text-xs">({meta.name})</span></p>
                    <p className="text-amber-700 text-[10px]">{s.salary_per_hour}€/h · Nv.{s.level}</p>
                  </div>
                  <button
                    onClick={() => handleFire(s.id)}
                    disabled={firing === s.id}
                    className={`text-xs px-2 py-1 rounded-lg transition-all ${confirm === s.id ? 'bg-red-800 text-red-200 animate-pulse' : 'bg-amber-900 text-amber-600 border border-amber-800'}`}
                  >
                    {firing === s.id ? '...' : confirm === s.id ? '¿Seguro?' : 'Despedir'}
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-amber-700 text-[10px] mt-2 border-t border-amber-900 pt-2">
            Coste total: {totalSalary}€/h · {(totalSalary * 24).toLocaleString('es-ES')}€/día
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {(Object.entries(STAFF_META) as [keyof typeof STAFF_META, typeof STAFF_META[keyof typeof STAFF_META]][]).map(([type, meta]) => {
          const isHired = hiredTypes.has(type)
          const canAfford = money >= meta.cost
          return (
            <div key={type} className={`card flex items-start gap-3 transition-opacity ${isHired ? 'opacity-50' : ''}`}>
              <span className="text-3xl shrink-0 mt-0.5">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-200 text-sm">{meta.name}</p>
                <p className="text-amber-600 text-xs leading-snug mt-0.5">{meta.desc}</p>
                <p className="text-amber-800 text-[10px] mt-1">{meta.effect} · {meta.salary}€/h</p>
              </div>
              <div className="shrink-0">
                {isHired ? (
                  <span className="badge bg-green-900 text-green-400">✓</span>
                ) : (
                  <button
                    onClick={() => handleHire(type)}
                    disabled={!canAfford || hiring === type}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      canAfford ? 'btn-primary' : 'bg-amber-900/40 text-amber-700 border border-amber-800 cursor-not-allowed'
                    } disabled:opacity-60`}
                  >
                    {hiring === type ? '...' : `${meta.cost.toLocaleString('es-ES')}€`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-amber-800 text-[10px] text-center">
        El personal reduce la degradación de necesidades y el coste se descuenta automáticamente cada turno
      </p>
    </div>
  )
}
