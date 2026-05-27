'use client'
import { Residence, Resident, GameEvent, Room } from '@/lib/types'
import RoomCell, { ROOM_META } from './RoomCell'

interface Props {
  residence: Residence
  residents: Resident[]
  events: GameEvent[]
  rooms: Room[]
  onResolve: (eventId: string) => Promise<void>
  onGoToBuild: () => void
}

const FULL_WIDTH_ROOMS = ['garden', 'dining_room']

export default function ResidenceMap({ residence, residents, events, rooms, onResolve, onGoToBuild }: Props) {
  // Group residents by current_room_type
  const residentsByRoom: Record<string, Resident[]> = {}
  residents.forEach(r => {
    const room = r.current_room_type || 'bedroom'
    if (!residentsByRoom[room]) residentsByRoom[room] = []
    residentsByRoom[room].push(r)
  })

  // Group events by resident, then by room
  const eventsByResident: Record<string, GameEvent[]> = {}
  events.forEach(e => {
    if (!eventsByResident[e.resident_id]) eventsByResident[e.resident_id] = []
    eventsByResident[e.resident_id].push(e)
  })

  const getEventsForResidents = (roomResidents: Resident[]) =>
    events.filter(e => roomResidents.some(r => r.id === e.resident_id))

  // Build bedroom cells (one per resident, in creation order)
  const bedroomCount = rooms.filter(r => r.type === 'bedroom').length
  const bedrooms = Array.from({ length: bedroomCount }, (_, i) => ({
    index: i,
    assignedResident: residents[i] || null,
    currentlyHere: residents[i]
      ? (residentsByRoom['bedroom'] || []).filter(r => r.id === residents[i].id)
      : [],
  }))

  // Non-bedroom rooms (unique)
  const otherRoomTypes = Array.from(new Set(rooms.filter(r => r.type !== 'bedroom').map(r => r.type)))

  const totalEvents = events.length
  const criticalEvents = events.filter(e => e.urgency === 'critical').length

  return (
    <div className="flex flex-col gap-3">
      {/* Quick stats bar */}
      <div className="flex gap-2 text-xs">
        <div className="flex-1 card py-2 text-center">
          <p className="text-green-400 font-bold">{residence.money.toLocaleString('es-ES')}€</p>
          <p className="text-amber-700">fondos</p>
        </div>
        <div className="flex-1 card py-2 text-center">
          <p className="text-amber-300 font-bold">Nv.{residence.level}</p>
          <p className="text-amber-700">JR</p>
        </div>
        <div className={`flex-1 card py-2 text-center ${criticalEvents > 0 ? 'border-red-700/60' : ''}`}>
          <p className={`font-bold ${totalEvents === 0 ? 'text-green-400' : criticalEvents > 0 ? 'text-red-400' : 'text-orange-400'}`}>
            {totalEvents === 0 ? '😌' : criticalEvents > 0 ? `🚨${criticalEvents}` : `⚠️${totalEvents}`}
          </p>
          <p className="text-amber-700">urgencias</p>
        </div>
        <div className="flex-1 card py-2 text-center">
          <p className="text-amber-300 font-bold">{residents.length}</p>
          <p className="text-amber-700">residentes</p>
        </div>
      </div>

      {/* Map grid */}
      {rooms.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="text-amber-400 font-semibold">La residencia está vacía.</p>
          <p className="text-amber-700 text-sm mt-1">Construye habitaciones para empezar.</p>
          <button onClick={onGoToBuild} className="btn-primary mt-4 text-sm">Ir a Obras</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Bedrooms */}
          {bedrooms.map(({ index, assignedResident, currentlyHere }) => {
            const bedroomEvents = assignedResident
              ? events.filter(e => e.resident_id === assignedResident.id && currentlyHere.some(r => r.id === assignedResident.id))
              : []
            return (
              <RoomCell
                key={`bedroom-${index}`}
                roomType="bedroom"
                roomIndex={index}
                assignedResident={assignedResident}
                residents={currentlyHere}
                events={bedroomEvents}
                onResolve={onResolve}
              />
            )
          })}

          {/* Other rooms */}
          {otherRoomTypes.map(type => {
            const roomResidents = residentsByRoom[type] || []
            const roomEvents = getEventsForResidents(roomResidents)
            const isFullWidth = FULL_WIDTH_ROOMS.includes(type)
            return (
              <RoomCell
                key={type}
                roomType={type}
                residents={roomResidents}
                events={roomEvents}
                onResolve={onResolve}
                fullWidth={isFullWidth}
              />
            )
          })}

          {/* Build more button */}
          <button
            onClick={onGoToBuild}
            className="col-span-2 border-2 border-dashed border-amber-800/40 rounded-2xl py-4 text-amber-700 hover:text-amber-500 hover:border-amber-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span className="text-xl">🔨</span> Construir nueva sala
          </button>
        </div>
      )}

      {/* Wandering residents (not in any built room) */}
      {(() => {
        const builtTypes = ['bedroom', ...otherRoomTypes]
        const wandering = residents.filter(r => !builtTypes.includes(r.current_room_type || 'bedroom'))
        if (wandering.length === 0) return null
        return (
          <div className="card">
            <p className="text-amber-600 text-xs font-semibold mb-2">🚶 Deambulando por el pasillo</p>
            <div className="flex flex-wrap gap-3">
              {wandering.map(r => (
                <div key={r.id} className="flex flex-col items-center gap-1">
                  <div className="animate-walk text-2xl">🚶</div>
                  <p className="text-amber-500 text-[10px]">{r.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
