import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CARE_CONFIG = {
  feed:     { field: 'hunger',        boost: 30, moneyCost: 15, energyCost: 0,  supplyField: 'supply_food'          },
  medicate: { field: 'medication',    boost: 30, moneyCost: 25, energyCost: 0,  supplyField: 'supply_medicine'      },
  chat:     { field: 'companionship', boost: 25, moneyCost: 0,  energyCost: 10, supplyField: null                   },
  shower:   { field: 'hygiene',       boost: 35, moneyCost: 10, energyCost: 0,  supplyField: 'supply_soap'          },
  entertain:{ field: 'entertainment', boost: 25, moneyCost: 5,  energyCost: 5,  supplyField: 'supply_entertainment' },
} as const

export async function POST(request: Request) {
  const { residentId, action } = await request.json() as { residentId: string; action: keyof typeof CARE_CONFIG }
  const cfg = CARE_CONFIG[action]
  if (!cfg) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id, money, jr_energy, supply_food, supply_medicine, supply_soap, supply_entertainment').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  if (cfg.moneyCost > 0 && residence.money < cfg.moneyCost)
    return NextResponse.json({ error: 'Sin fondos' }, { status: 400 })
  if (cfg.energyCost > 0 && residence.jr_energy < cfg.energyCost)
    return NextResponse.json({ error: 'Sin energía' }, { status: 400 })

  const sf = cfg.supplyField
  if (sf) {
    const stock = (residence as Record<string, number>)[sf] ?? 0
    if (stock <= 0)
      return NextResponse.json({ error: `Sin suministros: compra más ${sf.replace('supply_','').replace('_',' ')}` }, { status: 400 })
  }

  const { data: resident } = await supabase
    .from('residents').select('*').eq('id', residentId).eq('residence_id', residence.id).single()
  if (!resident) return NextResponse.json({ error: 'Resident not found' }, { status: 404 })

  const r = resident as Record<string, number>
  const newFieldVal = Math.min(100, (r[cfg.field] ?? 50) + cfg.boost)
  const updates: Record<string, unknown> = {}
  updates[cfg.field] = newFieldVal

  // Recalculate happiness immediately so the UI updates without waiting for tick
  const needs = {
    hunger:        cfg.field === 'hunger'        ? newFieldVal : (r.hunger        ?? 50),
    hygiene:       cfg.field === 'hygiene'       ? newFieldVal : (r.hygiene       ?? 50),
    medication:    cfg.field === 'medication'    ? newFieldVal : (r.medication    ?? 50),
    entertainment: cfg.field === 'entertainment' ? newFieldVal : (r.entertainment ?? 50),
    companionship: cfg.field === 'companionship' ? newFieldVal : (r.companionship ?? 50),
  }
  const baseHappiness = Math.round(
    (needs.hunger + needs.hygiene + needs.medication + needs.entertainment + needs.companionship) / 5
  )
  updates.happiness = Math.min(100, Math.max(0, baseHappiness))

  const residenceUpdate: Record<string, number> = {}
  if (cfg.moneyCost > 0)  residenceUpdate.money     = residence.money - cfg.moneyCost
  if (cfg.energyCost > 0) residenceUpdate.jr_energy = Math.max(0, residence.jr_energy - cfg.energyCost)
  if (sf) residenceUpdate[sf] = Math.max(0, ((residence as Record<string, number>)[sf] ?? 0) - 1)

  await Promise.all([
    supabase.from('residents').update(updates).eq('id', residentId),
    Object.keys(residenceUpdate).length > 0
      ? supabase.from('residences').update(residenceUpdate).eq('id', residence.id)
      : Promise.resolve(),
  ])

  return NextResponse.json({ ok: true, happiness: updates.happiness })
}
