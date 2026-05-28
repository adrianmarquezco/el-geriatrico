import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CARE_CONFIG = {
  feed:     { field: 'hunger',        boost: 30, moneyCost: 15, energyCost: 0  },
  medicate: { field: 'medication',    boost: 30, moneyCost: 25, energyCost: 0  },
  chat:     { field: 'companionship', boost: 25, moneyCost: 0,  energyCost: 10 },
  shower:   { field: 'hygiene',       boost: 35, moneyCost: 10, energyCost: 0  },
  entertain:{ field: 'entertainment', boost: 25, moneyCost: 5,  energyCost: 5  },
} as const

export async function POST(request: Request) {
  const { residentId, action } = await request.json() as { residentId: string; action: keyof typeof CARE_CONFIG }
  const cfg = CARE_CONFIG[action]
  if (!cfg) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id, money, jr_energy').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  if (cfg.moneyCost > 0 && residence.money < cfg.moneyCost)
    return NextResponse.json({ error: 'Sin fondos' }, { status: 400 })
  if (cfg.energyCost > 0 && residence.jr_energy < cfg.energyCost)
    return NextResponse.json({ error: 'Sin energía' }, { status: 400 })

  const { data: resident } = await supabase
    .from('residents').select('*').eq('id', residentId).eq('residence_id', residence.id).single()
  if (!resident) return NextResponse.json({ error: 'Resident not found' }, { status: 404 })

  const current = (resident as Record<string, number>)[cfg.field] ?? 50
  const updates: Record<string, unknown> = {}
  updates[cfg.field] = Math.min(100, current + cfg.boost)

  await Promise.all([
    supabase.from('residents').update(updates).eq('id', residentId),
    cfg.moneyCost > 0
      ? supabase.from('residences').update({ money: residence.money - cfg.moneyCost }).eq('id', residence.id)
      : cfg.energyCost > 0
        ? supabase.from('residences').update({ jr_energy: Math.max(0, residence.jr_energy - cfg.energyCost) }).eq('id', residence.id)
        : Promise.resolve(),
  ])

  return NextResponse.json({ ok: true })
}
