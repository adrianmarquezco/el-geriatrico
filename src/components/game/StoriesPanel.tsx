'use client'
import { useState } from 'react'
import { Story } from '@/lib/types'

interface Props {
  stories: Story[]
}

export default function StoriesPanel({ stories }: Props) {
  const [selected, setSelected] = useState<Story | null>(null)

  if (stories.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-4xl mb-3">📖</p>
        <p className="text-amber-400 font-semibold">Las historias se desbloquean jugando</p>
        <p className="text-amber-700 text-sm mt-1">Resuelve urgencias para descubrir los secretos del geriátrico</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
        <span>📖</span> Diario de JR
        <span className="text-amber-700 text-xs font-normal">({stories.length} capítulo{stories.length !== 1 ? 's' : ''})</span>
      </h2>

      {selected ? (
        <div className="card">
          <button onClick={() => setSelected(null)} className="text-amber-600 text-xs mb-3 flex items-center gap-1">
            ← Volver
          </button>
          <p className="text-amber-700 text-[10px] mb-1">Capítulo {selected.chapter}</p>
          <h3 className="text-amber-200 font-bold text-base mb-3">{selected.title}</h3>
          <p className="text-amber-400 text-sm leading-relaxed italic">"{selected.content}"</p>
          <p className="text-amber-800 text-[10px] mt-4">
            {new Date(selected.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {stories
            .sort((a, b) => a.chapter - b.chapter)
            .map(story => (
              <button
                key={story.id}
                onClick={() => setSelected(story)}
                className="card flex items-center gap-3 text-left active:scale-98 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-amber-900/60 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-bold text-sm">{story.chapter}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-200 font-semibold text-sm leading-tight">{story.title}</p>
                  <p className="text-amber-700 text-[10px] mt-0.5 truncate">
                    {new Date(story.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-amber-700">›</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
