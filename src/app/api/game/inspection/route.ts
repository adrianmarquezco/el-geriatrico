import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { eventId, reputationDelta, moneyBonus } = await request.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id, money, reputation').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const newReputation = Math.max(0, Math.min(100, residence.reputation + reputationDelta))
  const newMoney = residence.money + (moneyBonus || 0)

  await Promise.all([
    supabase.from('residences').update({ reputation: newReputation, money: newMoney }).eq('id', residence.id),
    supabase.from('events').update({ resolved_at: new Date().toISOString() }).eq('id', eventId),
  ])

  return NextResponse.json({ ok: true, newReputation, newMoney })
}
