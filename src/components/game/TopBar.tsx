'use client'

interface Props {
  residence: any
}

export default function TopBar({ residence }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-amber-950/95 backdrop-blur border-b border-amber-800/50 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-bold text-amber-300 text-sm leading-none">{residence.name}</h1>
          <p className="text-amber-600 text-xs mt-0.5">Nivel {residence.level}</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-amber-400 font-semibold">💰 {residence.money.toLocaleString('es-ES')}€</span>
          <span className="text-green-400 font-semibold">⭐ {residence.reputation}</span>
        </div>
      </div>

      {/* JR energy bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-600 whitespace-nowrap">JR</span>
        <div className="flex-1 h-2 bg-amber-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${residence.jr_energy}%` }}
          />
        </div>
        <span className="text-xs text-amber-600">{residence.jr_energy}%</span>
      </div>
    </header>
  )
}
