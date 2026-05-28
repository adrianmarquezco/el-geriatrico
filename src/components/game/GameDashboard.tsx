'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Residence, Resident, GameEvent, Room, Toast, StaffMember, DailyMission, Story, Achievement } from '@/lib/types'
import TopBar from './TopBar'
import IsometricGameMap from './IsometricGameMap'
import ResidentsPanel from './ResidentsPanel'
import EventsPanel from './EventsPanel'
import RoomsPanel from './RoomsPanel'
import StaffPanel from './StaffPanel'
import StoriesPanel from './StoriesPanel'
import MissionsWidget from './MissionsWidget'
import MiniGameModal from './MiniGameModal'
import FamilyVisitDialog from './FamilyVisitDialog'
import InspectionDialog from './InspectionDialog'
import NewspaperBriefing from './NewspaperBriefing'
import OnboardingFlow from './OnboardingFlow'
import AchievementsPanel from './AchievementsPanel'
import UnlockTree from './UnlockTree'
import ToastContainer from './Toast'
import { useGameSounds } from '@/hooks/useGameSounds'

type Tab = 'mapa' | 'residentes' | 'urgencias' | 'obras' | 'personal' | 'logros'

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
  staff: StaffMember[]
  missions: DailyMission[]
  stories: Story[]
  achievements: Achievement[]
}

const SEASONAL_BANNER: Record<string, { emoji: string; label: string; color: string }> = {
  navidad:     { emoji: '🎄', label: 'Navidad: +30% ingresos', color: 'bg-red-900/60' },
  reyes:       { emoji: '👑', label: 'Reyes: +30% ingresos', color: 'bg-yellow-900/60' },
  san_valentin:{ emoji: '💝', label: 'San Valentín: +10% ingresos', color: 'bg-pink-900/60' },
}

export default function GameDashboard({
  residence: init, residents: initR, events: initE,
  rooms: initRooms, staff: initStaff, missions: initMissions,
  stories: initStories, achievements: initAch,
}: Props) {
  const [residence, setResidence] = useState<Residence>(init)
  const [residents, setResidents] = useState<Resident[]>(initR)
  const [events, setEvents] = useState<GameEvent[]>(initE)
  const [rooms, setRooms] = useState<Room[]>(initRooms)
  const [staff, setStaff] = useState<StaffMember[]>(initStaff)
  const [missions, setMissions] = useState<DailyMission[]>(initMissions)
  const [stories, setStories] = useState<Story[]>(initStories)
  const [achievements, setAchievements] = useState<Achievement[]>(initAch)
  const [tab, setTab] = useState<Tab>('mapa')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [seasonalBanner, setSeasonalBanner] = useState<string | null>(null)
  const [miniGameEvent, setMiniGameEvent] = useState<{ event: GameEvent; resident: Resident } | null>(null)
  const [familyVisitData, setFamilyVisitData] = useState<{ event: GameEvent; resident: Resident } | null>(null)
  const [inspectionEvent, setInspectionEvent] = useState<GameEvent | null>(null)
  const [morningBriefing, setMorningBriefing] = useState<Residence['overnight_summary'] | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const prevStoriesCount = useRef(initStories.length)
  const { play, toggle: toggleSound } = useGameSounds()
  const supabase = createClient()

  // Show newspaper briefing on load if overnight summary exists
  useEffect(() => {
    const s = init.overnight_summary
    if (s && typeof s.income === 'number') {
      setMorningBriefing(s)
    }
  }, [])

  // Show onboarding for new players (after briefing closes)
  useEffect(() => {
    if (!init.onboarding_done && !morningBriefing) {
      setShowOnboarding(true)
    }
  }, [init.onboarding_done])

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const fetchState = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: res }, { data: res2 }, { data: ev }, { data: ro }, { data: st }, { data: ms }, { data: str }, { data: ach }] = await Promise.all([
      supabase.from('residences').select('*').eq('id', init.id).single(),
      supabase.from('residents').select('*').eq('residence_id', init.id).order('created_at'),
      supabase.from('events').select('*, residents(name)').eq('residence_id', init.id).is('resolved_at', null).order('created_at'),
      supabase.from('rooms').select('*').eq('residence_id', init.id),
      supabase.from('staff').select('*').eq('residence_id', init.id),
      supabase.from('daily_missions').select('*').eq('residence_id', init.id).eq('mission_date', today),
      supabase.from('stories').select('*').eq('residence_id', init.id).order('chapter'),
      supabase.from('achievements').select('*').eq('residence_id', init.id),
    ])
    if (res)  setResidence(res)
    if (res2) setResidents(res2)
    if (ev)   setEvents(ev)
    if (ro)   setRooms(ro)
    if (st)   setStaff(st)
    if (ms)   setMissions(ms)
    if (ach)  setAchievements(ach)
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
    if (data.is_new_day && data.overnight_summary && typeof data.overnight_summary.income === 'number') {
      setMorningBriefing(data.overnight_summary)
    }
    if (data.new_achievements && data.new_achievements.length > 0) {
      data.new_achievements.forEach((type: string) => {
        addToast(`🏆 ¡Logro desbloqueado!`, 'success')
        play('levelup')
      })
    }
    if (data.streak_days > (residence.streak_days ?? 0) && data.streak_days >= 3) {
      addToast(`🔥 ¡${data.streak_days} días sin crisis!`, 'success')
    }
  }, [fetchState, addToast, play, residence.streak_days])

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

  const handleRepairRoom = useCallback(async (roomId: string) => {
    const res = await fetch('/api/game/fix-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return }
    await fetchState()
    addToast('Tele reparada 🔧', 'success')
    play('success')
  }, [fetchState, addToast, play])

  const handleOpenMiniGame = useCallback((event: GameEvent, resident: Resident) => {
    setMiniGameEvent({ event, resident })
  }, [])

  const handleMiniGameSuccess = useCallback(async () => {
    if (!miniGameEvent) return
    const eventId = miniGameEvent.event.id
    setMiniGameEvent(null)
    const res = await fetch('/api/game/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    const data = await res.json()
    await fetchState()
    if (data.xp > 0) { addToast(`+${data.xp} XP 🧠`, 'xp'); play('success') }
    if (data.reward > 0) { addToast(`+${data.reward}€ 💰`, 'money'); play('coin') }
  }, [miniGameEvent, fetchState, addToast, play])

  const handleFamilyVisit = useCallback((event: GameEvent, resident: Resident) => {
    setFamilyVisitData({ event, resident })
  }, [])

  const handleFamilyVisitResolve = useCallback(async (eventId: string, donationMult: number) => {
    setFamilyVisitData(null)
    const event = events.find(e => e.id === eventId)
    const resident = residents.find(r => r.id === event?.resident_id)
    const donation = donationMult > 0
      ? Math.round(200 * donationMult * ((resident?.happiness ?? 70) / 100 + 0.5))
      : 0
    const res = await fetch('/api/game/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, bonusMoney: donation }),
    })
    const data = await res.json()
    await fetchState()
    if (donation > 0) {
      addToast(`+${donation}€ donación familiar 💝`, 'money')
      play('coin')
    } else if (donationMult < 0) {
      addToast('−10 reputación ⭐', 'warning')
      play('alarm')
    }
    if (data.xp) { addToast(`+${data.xp} XP 🧠`, 'xp') }
  }, [fetchState, addToast, play, residents, events])

  const handleInspection = useCallback((event: GameEvent) => {
    setInspectionEvent(event)
  }, [])

  const handleInspectionResolve = useCallback(async (eventId: string, reputationDelta: number, moneyBonus: number) => {
    setInspectionEvent(null)
    play(reputationDelta > 0 ? 'success' : reputationDelta < 0 ? 'alarm' : 'tap')
    const res = await fetch('/api/game/inspection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, reputationDelta, moneyBonus }),
    })
    await res.json()
    await fetchState()
    if (moneyBonus > 0) addToast(`+${moneyBonus}€ subvención 🏛️`, 'money')
    if (reputationDelta > 0) addToast(`+${reputationDelta} reputación ⭐`, 'success')
    if (reputationDelta < 0) addToast(`${reputationDelta} reputación ⭐`, 'warning')
  }, [fetchState, addToast, play])

  const handleCollect = useCallback(async (value: number, type: 'money' | 'xp') => {
    play('coin')
    if (navigator.vibrate) navigator.vibrate(30)
    addToast(type === 'money' ? `+${value}€ 💰` : `+${value} XP ⭐`, type === 'money' ? 'money' : 'xp')
    fetch('/api/game/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, type }),
    }).then(() => fetchState())
  }, [addToast, play, fetchState])

  const handleCare = useCallback(async (residentId: string, action: 'feed' | 'medicate' | 'chat') => {
    const res = await fetch('/api/game/care', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ residentId, action }),
    })
    const data = await res.json()
    if (data.error) { addToast(data.error, 'warning'); return }
    await fetchState()
    const labels = { feed: '🍽️ Alimentado', medicate: '💊 Medicado', chat: '💬 Animado' }
    addToast(labels[action], 'success')
    play('tap')
  }, [fetchState, addToast, play])

  const handleOnboardingComplete = useCallback(async () => {
    setShowOnboarding(false)
    await fetch('/api/game/onboarding-done', { method: 'POST' })
  }, [])

  const urgentCount = events.length
  const pendingMissions = missions.filter(m => m.completed_at && !m.claimed_at).length

  const TABS = [
    { id: 'mapa',       label: 'Residencia', icon: '🏠' },
    { id: 'residentes', label: 'Residentes',  icon: '👴' },
    { id: 'urgencias',  label: 'Urgencias',  icon: '🚨', badge: urgentCount },
    { id: 'obras',      label: 'Obras',      icon: '🔨' },
    { id: 'personal',   label: 'Personal',   icon: '👩‍⚕️' },
    { id: 'logros',     label: 'Logros',     icon: '🏆', badge: pendingMissions > 0 ? pendingMissions : undefined },
  ] as Array<{ id: Tab; label: string; icon: string; badge?: number }>

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
        {/* Missions widget on map and urgencias */}
        {(tab === 'mapa' || tab === 'urgencias') && missions.length > 0 && (
          <MissionsWidget missions={missions} onClaim={handleClaimMission} />
        )}

        {tab === 'mapa' && (
          <IsometricGameMap
            residence={residence}
            residents={residents}
            events={events}
            rooms={rooms}
            onResolve={handleResolve}
            onGoToBuild={() => setTab('obras')}
            onRepairRoom={handleRepairRoom}
            onOpenMiniGame={handleOpenMiniGame}
            onFamilyVisit={handleFamilyVisit}
            onInspection={handleInspection}
            onCollect={handleCollect}
            onCare={handleCare}
          />
        )}
        {tab === 'residentes' && (
          <ResidentsPanel
            residents={residents}
            money={residence.money}
            jrEnergy={residence.jr_energy}
            onCare={handleCare}
          />
        )}
        {tab === 'urgencias'  && <EventsPanel events={events} onResolve={handleResolve} />}
        {tab === 'obras'      && <RoomsPanel rooms={rooms} money={residence.money} onBuild={handleBuild} onUpgrade={handleUpgrade} />}
        {tab === 'personal'   && <StaffPanel staff={staff} money={residence.money} onHire={handleHire} onFire={handleFire} />}
        {tab === 'logros'     && (
          <div className="flex flex-col gap-3">
            <UnlockTree residence={residence} />
            <div className="h-px bg-amber-900/40" />
            <AchievementsPanel achievements={achievements} residence={residence} />
          </div>
        )}
      </main>

      {/* Modals */}
      {miniGameEvent && (
        <MiniGameModal
          event={miniGameEvent.event}
          resident={miniGameEvent.resident}
          roomResidents={residents.filter(r => r.current_room_type === miniGameEvent.resident.current_room_type)}
          onSuccess={handleMiniGameSuccess}
          onClose={() => setMiniGameEvent(null)}
          play={play}
        />
      )}

      {familyVisitData && (
        <FamilyVisitDialog
          event={familyVisitData.event}
          resident={familyVisitData.resident}
          onResolve={handleFamilyVisitResolve}
          onClose={() => setFamilyVisitData(null)}
          play={play}
        />
      )}

      {inspectionEvent && (
        <InspectionDialog
          event={inspectionEvent}
          residents={residents}
          onResolve={handleInspectionResolve}
          onClose={() => setInspectionEvent(null)}
          play={play}
        />
      )}

      {morningBriefing && (
        <NewspaperBriefing
          summary={morningBriefing}
          residenceName={residence.name}
          streakDays={residence.streak_days ?? 0}
          onClose={() => {
            setMorningBriefing(null)
            if (!init.onboarding_done) setShowOnboarding(true)
          }}
        />
      )}

      {showOnboarding && !morningBriefing && (
        <OnboardingFlow
          residenceName={residence.name}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex"
        style={{ background: 'rgba(7,8,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0 text-[10px] transition-colors relative ${tab === t.id ? 'text-amber-400' : 'text-slate-600'}`}
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
