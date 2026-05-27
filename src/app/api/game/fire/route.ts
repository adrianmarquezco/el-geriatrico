import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { staffId } = await req.json()
  const { data: residence } = await supabase
    .from('residences').select('id').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const { data } = await supabase.rpc('fire_staff', {
    p_staff_id: staffId,
    p_residence_id: residence.id,
  })
  return NextResponse.json(data || {})
}
