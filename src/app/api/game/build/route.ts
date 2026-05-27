import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { roomType } = await request.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const { data } = await supabase.rpc('build_room', {
    p_residence_id: residence.id,
    p_room_type: roomType,
  })
  return NextResponse.json(data || {})
}
