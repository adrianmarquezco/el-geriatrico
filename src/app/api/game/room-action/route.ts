import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ROOM_ACTIONS: Record<string, {
  need: string; boost: number; moneyCost: number; energyCost: number
  supplyField?: keyof SupplyFields; supplyPerResident?: number
}> = {
  dining_room:   { need: 'hunger',        boost: 30, moneyCost: 30, energyCost: 0,  supplyField: 'supply_food',          supplyPerResident: 1 },
  infirmary:     { need: 'medication',    boost: 30, moneyCost: 25, energyCost: 0,  supplyField: 'supply_medicine',      supplyPerResident: 1 },
  barbershop:    { need: 'hygiene',       boost: 30, moneyCost: 20, energyCost: 0,  supplyField: 'supply_soap',          supplyPerResident: 1 },
  bedroom:       { need: 'hygiene',       boost: 15, moneyCost: 10, energyCost: 0,  supplyField: 'supply_soap',          supplyPerResident: 1 },
  tv_room:       { need: 'entertainment', boost: 25, moneyCost: 10, energyCost: 8,  supplyField: 'supply_entertainment', supplyPerResident: 1 },
  cards_room:    { need: 'entertainment', boost: 20, moneyCost: 0,  energyCost: 5  },
  garden:        { need: 'companionship', boost: 20, moneyCost: 0,  energyCost: 6  },
  chapel:        { need: 'companionship', boost: 20, moneyCost: 0,  energyCost: 4  },
  physiotherapy: { need: 'medication',    boost: 20, moneyCost: 20, energyCost: 0,  supplyField: 'supply_medicine',      supplyPerResident: 1 },
}

interface SupplyFields {
  supply_food: number
  supply_medicine: number
  supply_soap: number
  supply_entertainment: number
}

export async function POST(request: Request) {
  const { roomType } = await request.json() as { roomType: string }
  const cfg = ROOM_ACTIONS[roomType]
  if (!cfg) return NextResponse.json({ error: 'Sala inválida' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: res } = await supabase
    .from('residences')
    .select('id, money, jr_energy, supply_food, supply_medicine, supply_soap, supply_entertainment')
    .eq('user_id', user.id).single()
  if (!res) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  if (cfg.moneyCost > 0 && res.money < cfg.moneyCost)
    return NextResponse.json({ error: `Necesitas ${cfg.moneyCost}€` }, { status: 400 })
  if (cfg.energyCost > 0 && res.jr_energy < cfg.energyCost)
    return NextResponse.json({ error: 'Sin energía' }, { status: 400 })

  // Get residents currently in this room
  const { data: roomResidents } = await supabase
    .from('residents')
    .select('id')
    .eq('residence_id', res.id)
    .eq('current_room_type', roomType)
    .neq('activity', 'hospitalizado — esperando traslado')

  const count = roomResidents?.length ?? 0

  // Check supply if needed
  if (cfg.supplyField && cfg.supplyPerResident) {
    const needed = count * cfg.supplyPerResident
    const available = (res as unknown as SupplyFields)[cfg.supplyField] ?? 0
    if (available < needed && needed > 0)
      return NextResponse.json({ error: `Sin ${cfg.supplyField.replace('supply_','')}: necesitas ${needed}` }, { status: 400 })
  }

  // Boost all residents in room
  if (count > 0 && roomResidents) {
    const ids = roomResidents.map(r => r.id)
    const { data: residents } = await supabase
      .from('residents').select('id, hunger, hygiene, medication, entertainment, companionship').in('id', ids)

    if (residents) {
      await Promise.all(residents.map(r => {
        const current = (r as Record<string, number>)[cfg.need] ?? 50
        const newVal = Math.min(100, current + cfg.boost)
        const needs = {
          hunger: r.hunger, hygiene: r.hygiene, medication: r.medication,
          entertainment: r.entertainment, companionship: r.companionship,
          [cfg.need]: newVal,
        }
        const happiness = Math.min(100, Math.round(
          (needs.hunger + needs.hygiene + needs.medication + needs.entertainment + needs.companionship) / 5
        ))
        return supabase.from('residents').update({ [cfg.need]: newVal, happiness }).eq('id', r.id)
      }))
    }
  }

  // Deduct costs
  const supplyDeduction = cfg.supplyField && count > 0 && cfg.supplyPerResident
    ? { [cfg.supplyField]: Math.max(0, ((res as unknown as SupplyFields)[cfg.supplyField] ?? 0) - count * cfg.supplyPerResident) }
    : {}

  await supabase.from('residences').update({
    money: Math.max(0, res.money - cfg.moneyCost),
    jr_energy: Math.max(0, res.jr_energy - cfg.energyCost),
    ...supplyDeduction,
  }).eq('id', res.id)

  return NextResponse.json({ ok: true, affected: count, need: cfg.need, boost: cfg.boost })
}
