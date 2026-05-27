'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Residence, Resident, GameEvent, Room, Toast } from '@/lib/types'
import TopBar from './TopBar'
import ResidenceMap from './ResidenceMap'
import ResidentsPanel from './ResidentsPanel'
import EventsPanel from './EventsPanel'
import RoomsPanel from './RoomsPanel'
import ToastContainer from './Toast'

type Tab = 'mapa' | 'residentes' | 'urgencias' | 'obras'

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
}

export default function GameDashboard({ residence: init, residents: initR, events: initE, rooms: initRooms }: Props) {
  const [residence, setResidence] = useState<Residence>(init)
  const [residents, setResidents] = useState<Resident[]>(initR)
  const [events, setEvents] = useState<GameEvent[]>(initE)
  const [rooms, setRooms] = useState<Room[]>(initRooms)
  const [tab, setTab] = useState<Tab>('mapa')
  const [toasts, setToasts] = useState<Toast[]>([])
  const supabase = createClient()

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const fetchState = useCallback(async () => {
    const [{ data: res }, { data: res2 }, { data: ev }, { data: ro }] = await Promise.all([
      supabase.from('residences').select('*').eq('id', init.id).single(),
      supabase.from('residents').select('*').eq('residence_id', init.id).order('created_at'),
      supabase.from('events').select('*, residents(name)').eq('residence_id', init.id).is('resolved_at', null).order('created_at'),
      supabase.from('rooms').select('*').eq('residence_id', init.id),
    ])
    if (res)  setResidence(res)
    if (res2) setResidents(res2)
    if (ev)   setEvents(ev)
    if (ro)   setRooms(ro)
  }, [init.id])

  const runTick = useCallback(async () => {
    const res = await fetch('/api/game/tick', { method: 'POST' })
    const data = await res.json()
    await fetchState()
    if (data.income > 0) addToast(`+${data.income.toLocaleString('es-ES')}€ 💰`, 'money')
    if (data.events_created > 0) addToast(`${data.events_created} urgencia${data.events_created > 1 ? 's' : ''} nueva${data.events_created > 1 ? 's' : ''} 🚨`, 'warning')
  }, [fetchState, addToast])

  useEffect(() => {
    runTick()
    const interval = setInterval(runTick, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleResolve = useCallback(async (eventId: string) => {
    const res = await fetch('/api/game/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    const data = await res.json()
    await fetchState()
    if (data.xp)     addToast(`+${data.xp} XP 🧠`, 'xp')
    if (data.reward > 0) addToast(`+${data.reward}€ 💰`, 'money')
  }, [fetchState, addToast])

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
    if (data.new_resident) setTimeout(() => addToast('¡Nuevo residente ha llegado! 👴', 'new'), 600)
    return true
  }, [fetchState, addToast])

  const urgentCount = events.length

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <ToastContainer toasts={toasts} />
      <TopBar residence={residence} />

      <main className="flex-1 px-3 pb-24 pt-3">
        {tab === 'mapa'       && <ResidenceMap residence={residence} residents={residents} events={events} rooms={rooms} onResolve={handleResolve} onGoToBuild={() => setTab('obras')} />}
        {tab === 'residentes' && <ResidentsPanel residents={residents} />}
        {tab === 'urgencias'  && <EventsPanel events={events} onResolve={handleResolve} />}
        {tab === 'obras'      && <RoomsPanel rooms={rooms} money={residence.money} onBuild={handleBuild} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-amber-950/95 backdrop-blur border-t border-amber-800/50 flex">
        {([
          { id: 'mapa',       label: 'Residencia', icon: '🏠' },
          { id: 'residentes', label: 'Ancianos',   icon: '👴' },
          { id: 'urgencias',  label: 'Urgencias',  icon: '🚨', badge: urgentCount },
          { id: 'obras',      label: 'Obras',      icon: '🔨' },
        ] as Array<{ id: Tab; label: string; icon: string; badge?: number }>).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors relative ${tab === t.id ? 'text-amber-300' : 'text-amber-600'}`}
          >
            <span className="text-xl">{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && t.badge > 0 ? (
              <span className="absolute top-2 right-[22%] bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
