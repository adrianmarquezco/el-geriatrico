'use client'

const ROOMS = [
  { type: 'bedroom',        icon: '🛏️', label: 'Habitación',     cost: 1000, description: 'Acoge a un anciano más. Cada habitación, un nuevo personaje.' },
  { type: 'tv_room',        icon: '📺', label: 'Sala de TV',      cost: 2000, description: 'Reduce urgencias de entretenimiento. Ojo con el mando.' },
  { type: 'dining_room',    icon: '🍽️', label: 'Comedor',         cost: 2500, description: 'Mejora la alimentación de todos. Carmela quiere comer a las 2 en punto.' },
  { type: 'garden',         icon: '🌳', label: 'Jardín',          cost: 3000, description: 'Sube el humor. Alfredo saldrá igual en pijama, pero al menos hay flores.' },
  { type: 'infirmary',      icon: '🏥', label: 'Enfermería',      cost: 4000, description: 'Reduce urgencias de medicación. Vital a partir de 5 residentes.' },
  { type: 'chapel',         icon: '⛪', label: 'Capilla',         cost: 3500, description: 'Rosario dejará de rezar en el pasillo. El resto de beneficios son... espirituales.' },
  { type: 'barbershop',     icon: '💈', label: 'Peluquería',      cost: 2800, description: 'Sube higiene y humor. Lola lo visitará tres veces por semana.' },
  { type: 'cards_room',     icon: '🃏', label: 'Sala de cartas',  cost: 3200, description: 'Entretenimiento garantizado. También peleas garantizadas.' },
  { type: 'physiotherapy',  icon: '🤸', label: 'Fisioterapia',    cost: 5000, description: 'Reduce urgencias de caídas. Don Paco dice que no le hace falta.' },
]

interface Props {
  residenceId: string
  money: number
}

export default function RoomsPanel({ residenceId, money }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-amber-400 font-semibold text-sm">Ampliar residencia</h2>
      <p className="text-amber-600 text-xs -mt-1">Disponible: <span className="text-amber-400 font-semibold">{money.toLocaleString('es-ES')}€</span></p>

      {ROOMS.map(room => {
        const canAfford = money >= room.cost
        return (
          <div key={room.type} className={`card flex items-center gap-3 ${!canAfford ? 'opacity-50' : ''}`}>
            <span className="text-3xl">{room.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-200 text-sm">{room.label}</p>
              <p className="text-amber-600 text-xs leading-tight">{room.description}</p>
            </div>
            <button
              disabled={!canAfford}
              className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap shrink-0"
            >
              {room.cost.toLocaleString('es-ES')}€
            </button>
          </div>
        )
      })}
    </div>
  )
}
