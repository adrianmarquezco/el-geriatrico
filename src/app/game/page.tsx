import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GameDashboard from '@/components/game/GameDashboard'

export default async function GamePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: residence } = await supabase
    .from('residences').select('*').eq('user_id', user.id).single()
  if (!residence) redirect('/onboarding')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: residents }, { data: events }, { data: rooms }, { data: staff }, { data: missions }, { data: stories }, { data: achievements }, { data: activities }] = await Promise.all([
    supabase.from('residents').select('*').eq('residence_id', residence.id).order('created_at'),
    supabase.from('events').select('*, residents(name)').eq('residence_id', residence.id).is('resolved_at', null).order('created_at'),
    supabase.from('rooms').select('*').eq('residence_id', residence.id),
    supabase.from('staff').select('*').eq('residence_id', residence.id),
    supabase.from('daily_missions').select('*').eq('residence_id', residence.id).eq('mission_date', today),
    supabase.from('stories').select('*').eq('residence_id', residence.id).order('chapter'),
    supabase.from('achievements').select('*').eq('residence_id', residence.id),
    supabase.from('scheduled_activities').select('*').eq('residence_id', residence.id).is('completed_at', null).order('created_at', { ascending: false }),
  ])

  return (
    <GameDashboard
      residence={residence}
      residents={residents || []}
      events={events || []}
      rooms={rooms || []}
      staff={staff || []}
      missions={missions || []}
      stories={stories || []}
      achievements={achievements || []}
      activities={activities || []}
    />
  )
}
