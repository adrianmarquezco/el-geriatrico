'use client'
import { useState } from 'react'
import TopBar from './TopBar'
import ResidentsPanel from './ResidentsPanel'
import EventsPanel from './EventsPanel'
import RoomsPanel from './RoomsPanel'

type Tab = 'residencia' | 'residentes' | 'urgencias' | 'obras'

interface Props {
  residence: any
  residents: any[]
  events: any[]
}

export default function GameDashboard({ residence, residents, events }: Props) {
  const [tab, setTab] = useState<Tab>('residencia')

  const urgentCount = events.filter(e => !e.resolved_at).length

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <TopBar residence={residence} />

      <main className="flex-1 px-4 pb-24 pt-4">
        {tab === 'residencia' && (
          <ResidentsPanel residents={residents} residenceId={residence.id} />
        )}
        {tab === 'residentes' && (
          <ResidentsPanel residents={residents} residenceId={residence.id} detailed />
        )}
        {tab === 'urgencias' && (
          <EventsPanel events={events} residenceId={residence.id} />
        )}
        {tab === 'obras' && (
          <RoomsPanel residenceId={residence.id} money={residence.money} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-amber-950 border-t border-amber-800/50 flex">
        {([
          { id: 'residencia', label: 'Residencia', icon: '🏠' },
          { id: 'residentes', label: 'Ancianos', icon: '👴' },
          { id: 'urgencias', label: 'Urgencias', icon: '🚨', badge: urgentCount },
          { id: 'obras', label: 'Obras', icon: '🔨' },
        ] as Array<{ id: Tab; label: string; icon: string; badge?: number }>).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors relative ${
              tab === t.id ? 'text-amber-300' : 'text-amber-600'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && t.badge > 0 ? (
              <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}
