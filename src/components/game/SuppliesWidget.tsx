'use client'
import { useState } from 'react'
import { Residence } from '@/lib/types'

const SUPPLIES = [
  { key: 'food',          field: 'supply_food'          as const, icon: '🍽️', label: 'Comida',    cost: 40, color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)'  },
  { key: 'medicine',      field: 'supply_medicine'      as const, icon: '💊', label: 'Medicinas', cost: 50, color: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)'  },
  { key: 'soap',          field: 'supply_soap'          as const, icon: '🚿', label: 'Higiene',   cost: 30, color: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)'   },
  { key: 'entertainment', field: 'supply_entertainment' as const, icon: '📺', label: 'Ocio',      cost: 20, color: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)'  },
]

interface Props {
  residence: Residence
  onBuy: (supplyType: string) => Promise<void>
}

export default function SuppliesWidget({ residence, onBuy }: Props) {
  const [buying, setBuying] = useState<string | null>(null)

  async function handleBuy(key: string) {
    setBuying(key)
    await onBuy(key)
    setBuying(null)
  }

  const anyLow = SUPPLIES.some(s => residence[s.field] <= 2)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(9,11,20,0.95)', border: `1px solid ${anyLow ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suministros</p>
        {anyLow && <span className="text-[9px] font-black text-red-400 animate-pulse">¡Stocks bajos!</span>}
      </div>
      <div className="grid grid-cols-4 gap-1.5 px-2 pb-2.5">
        {SUPPLIES.map(s => {
          const stock = residence[s.field] ?? 0
          const isEmpty = stock === 0
          const isLow   = stock > 0 && stock <= 3
          const canAfford = residence.money >= s.cost
          return (
            <button
              key={s.key}
              onClick={() => handleBuy(s.key)}
              disabled={buying === s.key || !canAfford}
              className="flex flex-col items-center gap-1 py-2 rounded-xl active:scale-95 transition-all disabled:opacity-50"
              style={{ background: isEmpty ? 'rgba(239,68,68,0.12)' : s.color, border: `1px solid ${isEmpty ? 'rgba(239,68,68,0.45)' : s.border}` }}
            >
              <span className="text-lg leading-none">{buying === s.key ? '⏳' : s.icon}</span>
              <span className={`text-sm font-black leading-none ${isEmpty ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-200'}`}>
                {isEmpty ? '0' : stock}
              </span>
              <span className="text-[8px] text-slate-500 leading-none">+10 · {s.cost}€</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
