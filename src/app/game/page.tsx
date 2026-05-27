import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GameDashboard from '@/components/game/GameDashboard'

export default async function GamePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: residence } = await supabase
    .from('residences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!residence) redirect('/onboarding')

  const { data: residents } = await supabase
    .from('residents')
    .select('*')
    .eq('residence_id', residence.id)
    .order('created_at')

  const { data: events } = await supabase
    .from('events')
    .select('*, residents(name)')
    .eq('residence_id', residence.id)
    .is('resolved_at', null)
    .order('created_at')

  return (
    <GameDashboard
      residence={residence}
      residents={residents || []}
      events={events || []}
    />
  )
}
