import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { activityId } = await request.json() as { activityId: string }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: residence } = await supabase
    .from('residences').select('id, money, jr_experience, level').eq('user_id', user.id).single()
  if (!residence) return NextResponse.json({ error: 'No residence' }, { status: 404 })

  const { data: activity } = await supabase
    .from('scheduled_activities')
    .select('*').eq('id', activityId).eq('residence_id', residence.id).is('completed_at', null).single()
  if (!activity) return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })

  // Boost all active residents
  const { data: residents } = await supabase
    .from('residents')
    .select('id, hunger, hygiene, medication, entertainment, companionship')
    .eq('residence_id', residence.id)
    .neq('activity', 'hospitalizado — esperando traslado')

  if (residents && activity.affects_need && activity.affects_boost > 0) {
    await Promise.all(residents.map(r => {
      const rec = r as Record<string, number>
      const current = rec[activity.affects_need] ?? 50
      const newVal = Math.min(100, current + activity.affects_boost)
      const needs = {
        hunger: r.hunger, hygiene: r.hygiene, medication: r.medication,
        entertainment: r.entertainment, companionship: r.companionship,
        [activity.affects_need]: newVal,
      }
      const happiness = Math.min(100, Math.round(
        (needs.hunger + needs.hygiene + needs.medication + needs.entertainment + needs.companionship) / 5
      ))
      return supabase.from('residents').update({ [activity.affects_need]: newVal, happiness }).eq('id', r.id)
    }))
  }

  // Mark complete + rewards
  const newXp = residence.jr_experience + activity.reward_xp
  const xpForNext = residence.level * 200
  const newLevel = newXp >= xpForNext ? residence.level + 1 : residence.level

  await Promise.all([
    supabase.from('scheduled_activities').update({ completed_at: new Date().toISOString() }).eq('id', activityId),
    supabase.from('residences').update({
      money: residence.money + activity.reward_money,
      jr_experience: newXp,
      level: newLevel,
    }).eq('id', residence.id),
  ])

  return NextResponse.json({
    ok: true,
    money: activity.reward_money,
    xp: activity.reward_xp,
    affected: residents?.length ?? 0,
    need: activity.affects_need,
    boost: activity.affects_boost,
  })
}
