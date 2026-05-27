import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { eventId } = await request.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const { data } = await supabase.rpc('resolve_event', {
    p_event_id: eventId,
    p_residence_id: residence.id,
  })
  return NextResponse.json(data || {})
}
