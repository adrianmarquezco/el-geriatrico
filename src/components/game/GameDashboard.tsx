'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Residence, Resident, GameEvent, Room, Toast, StaffMember, DailyMission, Story } from '@/lib/types'
import TopBar from './TopBar'
import GameMap from './GameMap'
import ResidentsPanel from './ResidentsPanel'
import EventsPanel from './EventsPanel'
import RoomsPanel from './RoomsPanel'
import StaffPanel from './StaffPanel'
import StoriesPanel from './StoriesPanel'
import MissionsWidget from './MissionsWidget'
import ToastContainer from './Toast'
import { useGameSounds } from '@/hooks/useGameSounds'

type Tab = 'mapa' | 'residentes' | 'urgencias' | 'obras' | 'personal' | 'diario'

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
  staff: StaffMember[]
  missions: DailyMission[]
  stories: Story[]
}

const SEASONAL_BANNER: Record<string, { emoji: string; label: string; color: string }> = {
  navidad:     { emoji: '🎄', label: 'Navidad: +30% ingresos', color: 'bg-red-900/60' },
  reyes:       { emoji: '👑', label: 'Reyes: +30% ingresos', color: 'bg-yellow-900/60' },
  san_valentin:{ emoji: '💝', label: 'San Valentín: +10% ingresos', color: 'bg-pink-900/60' },
}

export default function GameDashboard({
  residence: init, residents: initR, events: initE,
  rooms: initRooms, staff: initStaff, missions: initMissions, stories: initStories
}: Props) {
  const [residence, setResidence] = useState<Residence>(init)
  const [residents, setResidents] = useState<Resident[]>(initR)
  const [events, setEvents] = useState<GameEvent[]>(initE)
  const [rooms, setRooms] = useState<Room[]>(initRooms)
  const [staff, setStaff] = useState<StaffMember[]>(initStaff)
  const [missions, setMissions] = useState<DailyMission[]>(initMissions)
  const [stories, setStories] = useState<Story[]>(initStories)
  const [tab, setTab] = useState<Tab>('mapa')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [seasonalBanner, setSeasonalBanner] = useState<string | null>(null)
  const prevStoriesCount = useRef(initStories.length)
  const { play, toggle: toggleSound } = useGameSounds()
  const supabase = createClient()

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const fetchState = useCallback(async () => {
    const [{ data: res }, { data: res2 }, { data: ev }, { data: ro }, { data: st }, { data: ms }, { data: str }] = await Promise.all([
      supabase.from('residences').select('*').eq('id', init.id).single(),
      supabase.from('residents').select('*').eq('residence_id', init.id).order('created_at'),
      supabase.from('events').select('*, residents(name)').eq('residence_id', init.id).is('resolved_at', null).order('created_at'),
      supabase.from('rooms').select('*').eq('residence_id', init.id),
      supabase.from('staff').select('*').eq('residence_id', init.id),
      supabase.from('daily_missions').select('*').eq('residence_id', init.id).eq('mission_date', new Date().toISOString().split('T')[0]),
      supabase.from('stories').select('*').eq('residence_id', init.id).order('chapter'),
    ])
    if (res)  setResidence(res)
    if (res2) setResidents(res2)
    if (ev)   setEvents(ev)
    if (ro)   setRooms(ro)
    if (st)   setStaff(st)
    if (ms)   setMissions(ms)
    if (str) {
      if (str.length > prevStoriesCount.current) {
        const newest = str[str.length - 1]
        addToast(`📖 Nueva historia: "${newest.title}"`, 'story')
        play('mission')
      }
      prevStoriesCount.current = str.length
      setStories(str)
    }
  }, [init.id])

  const runTick = useCallback(async () => {
    const res = await fetch('/api/game/tick', { method: 'POST' })
    const data = await res.json()
    await fetchState()
    if (data.income > 0) {
      addToast(`+${data.income.toLocaleString('es-ES')}€ 💰`, 'money')
      play('coin')
    }
    if (data.events_created > 0) {
      addToast(`${data.events_created} urgencia${data.events_created > 1 ? 's' : ''} nueva${data.events_created > 1 ? 's' : ''} 🚨`, 'warning')
      play('alarm')
    }
    if (data.salary_paid > 0) {
      addToast(`−${data.salary_paid.toLocaleString('es-ES')}€ nómina 👩‍⚕️`, 'warning')
    }
    if (data.seasonal && SEASONAL_BANNER[data.seasonal]) {
      setSeasonalBanner(data.seasonal)
    }
  }, [fetchState, addToast, play])

  useEffect(() => {
    runTick()
    const interval = setInterval(runTick, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleResolve = useCallback(async (eventId: string) => {
    play('tap')
    if (navigator.vibrate) navigator.vibrate(30)
    const res = await fetch('/api/game/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    const data = await res.json()
    await fetchState()
    if (data.xp)        { addToast(`+${data.xp} XP 🧠`, 'xp'); play('success') }
    if (data.reward > 0){ addToast(`+${data.reward}€ 💰`, 'money'); play('coin') }
  }, [fetchState, addToast, play])

  const handleBuild = useCallback(async (roomType: string) => {
    const res = await fetch('/api/game/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomType }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return false }
    await fetchState()
    addToast('¡Sala construida! 🏗️', 'success')
    play('success')
    if (data.new_resident) setTimeout(() => { addToast('¡Nuevo residente ha llegado! 👴', 'new'); play('levelup') }, 600)
    return true
  }, [fetchState, addToast, play])

  const handleUpgrade = useCallback(async (roomId: string) => {
    const res = await fetch('/api/game/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return false }
    await fetchState()
    addToast(`¡Sala mejorada a Nv.${data.new_level}! ⬆️`, 'success')
    play('levelup')
    return true
  }, [fetchState, addToast, play])

  const handleHire = useCallback(async (staffType: string) => {
    const res = await fetch('/api/game/hire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffType }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return false }
    await fetchState()
    addToast(`¡${data.name} contratado/a! 🎉`, 'success')
    play('success')
    return true
  }, [fetchState, addToast, play])

  const handleFire = useCallback(async (staffId: string) => {
    const res = await fetch('/api/game/fire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    })
    await res.json()
    await fetchState()
    addToast('Personal despedido', 'warning')
  }, [fetchState, addToast])

  const handleClaimMission = useCallback(async (missionId: string) => {
    const res = await fetch('/api/game/claim-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return }
    await fetchState()
    addToast(`Misión: +${data.money}€ +${data.xp} XP 🎯`, 'mission')
    play('mission')
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
  }, [fetchState, addToast, play])

  const urgentCount = events.length
  const pendingMissions = missions.filter(m => m.completed_at && !m.claimed_at).length
  const newStories = stories.length > 0 ? 0 : 0 // just for badge logic

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <ToastContainer toasts={toasts} />

      {/* Seasonal banner */}
      {seasonalBanner && SEASONAL_BANNER[seasonalBanner] && (
        <div className={`${SEASONAL_BANNER[seasonalBanner].color} text-center py-1.5 text-xs font-semibold text-white`}>
          {SEASONAL_BANNER[seasonalBanner].emoji} {SEASONAL_BANNER[seasonalBanner].label}
        </div>
      )}

      <TopBar residence={residence} onSoundToggle={toggleSound} />

      <main className="flex-1 px-3 pb-24 pt-3 flex flex-col gap-3">
        {/* Missions widget always visible on map and urgencias tabs */}
        {(tab === 'mapa' || tab === 'urgencias') && missions.length > 0 && (
          <MissionsWidget missions={missions} onClaim={handleClaimMission} />
        )}

        {tab === 'mapa'       && <GameMap residence={residence} residents={residents} events={events} rooms={rooms} onResolve={handleResolve} onGoToBuild={() => setTab('obras')} />}
        {tab === 'residentes' && <ResidentsPanel residents={residents} />}
        {tab === 'urgencias'  && <EventsPanel events={events} onResolve={handleResolve} />}
        {tab === 'obras'      && <RoomsPanel rooms={rooms} money={residence.money} onBuild={handleBuild} onUpgrade={handleUpgrade} />}
        {tab === 'personal'   && <StaffPanel staff={staff} money={residence.money} onHire={handleHire} onFire={handleFire} />}
        {tab === 'diario'     && <StoriesPanel stories={stories} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-amber-950/95 backdrop-blur border-t border-amber-800/50 flex">
        {([
          { id: 'mapa',       label: 'Residencia', icon: '🏠' },
          { id: 'residentes', label: 'Residentes',  icon: '👴' },
          { id: 'urgencias',  label: 'Urgencias',  icon: '🚨', badge: urgentCount },
          { id: 'obras',      label: 'Obras',      icon: '🔨' },
          { id: 'personal',   label: 'Personal',   icon: '👩‍⚕️' },
          { id: 'diario',     label: 'Diario',     icon: '📖', badge: pendingMissions > 0 ? pendingMissions : undefined },
        ] as Array<{ id: Tab; label: string; icon: string; badge?: number }>).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0 text-[10px] transition-colors relative ${tab === t.id ? 'text-amber-300' : 'text-amber-600'}`}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && t.badge > 0 ? (
              <span className="absolute top-1.5 right-[8%] bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold animate-pulse">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
