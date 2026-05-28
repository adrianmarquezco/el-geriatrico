import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { value, type } = await request.json() as { value: number; type: 'money' | 'xp' }
  if (!value || value <= 0 || value > 500) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id, money, jr_experience').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const update = type === 'money'
    ? { money: residence.money + value }
    : { jr_experience: residence.jr_experience + value }

  await supabase.from('residences').update(update).eq('id', residence.id)
  return NextResponse.json({ ok: true })
}
