import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SUPPLY_PACKS: Record<string, { field: keyof SupplyFields; qty: number; cost: number }> = {
  food:          { field: 'supply_food',          qty: 10, cost: 40 },
  medicine:      { field: 'supply_medicine',       qty: 10, cost: 50 },
  soap:          { field: 'supply_soap',           qty: 10, cost: 30 },
  entertainment: { field: 'supply_entertainment',  qty: 10, cost: 20 },
}

interface SupplyFields {
  supply_food: number
  supply_medicine: number
  supply_soap: number
  supply_entertainment: number
}

export async function POST(request: Request) {
  const { supplyType } = await request.json() as { supplyType: string }
  const pack = SUPPLY_PACKS[supplyType]
  if (!pack) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: res } = await supabase
    .from('residences')
    .select('id, money, supply_food, supply_medicine, supply_soap, supply_entertainment')
    .eq('user_id', user.id).single()
  if (!res) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  if (res.money < pack.cost)
    return NextResponse.json({ error: `Necesitas ${pack.cost}€` }, { status: 400 })

  const current = (res as unknown as SupplyFields)[pack.field] ?? 0
  await supabase.from('residences').update({
    money: res.money - pack.cost,
    [pack.field]: current + pack.qty,
  }).eq('id', res.id)

  return NextResponse.json({ ok: true, qty: pack.qty, cost: pack.cost, newStock: current + pack.qty })
}
