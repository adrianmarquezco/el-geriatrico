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
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          📖
        </div>
        <div>
          <p className="text-slate-200 font-black text-base">Las historias se desbloquean jugando</p>
          <p className="text-slate-600 text-sm mt-1 max-w-xs">Resuelve urgencias para descubrir los secretos del geriátrico</p>
        </div>
        <div className="flex gap-3 mt-2 opacity-40">
          {['🔒','🔒','🔒'].map((e,i) => (
            <div key={i} className="w-12 h-16 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {e}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sorted = [...stories].sort((a, b) => a.chapter - b.chapter)

  if (selected) {
    return (
      <div className="flex flex-col gap-4 animate-slide-up">
        {/* Back button */}
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-slate-500 text-sm active:scale-95 transition-transform w-fit">
          <span>←</span>
          <span>Todos los capítulos</span>
        </button>

        {/* Chapter detail */}
        <div className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(9,11,20,0.98) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: '0 0 30px rgba(245,158,11,0.08)',
          }}>
          {/* Header gradient */}
          <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom,rgba(245,158,11,0.15),transparent)' }} />

          <div className="relative p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm"
                style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}>
                {selected.chapter}
              </div>
              <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Capítulo {selected.chapter}</p>
                <p className="text-slate-200 font-black text-base leading-tight">{selected.title}</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(245,158,11,0.4),transparent)' }} />
              <span className="text-amber-700 text-xs">✦</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(245,158,11,0.4))' }} />
            </div>

            {/* Content */}
            <p className="text-slate-300 text-sm leading-relaxed italic" style={{ fontFamily: 'Georgia, serif' }}>
              &ldquo;{selected.content}&rdquo;
            </p>

            <p className="text-amber-800 text-[10px] mt-6 text-right">
              {new Date(selected.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Next/prev navigation */}
        <div className="flex gap-2">
          {(() => {
            const idx = sorted.findIndex(s => s.id === selected.id)
            return (
              <>
                <button
                  onClick={() => idx > 0 && setSelected(sorted[idx - 1])}
                  disabled={idx === 0}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-25"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
                  ← Anterior
                </button>
                <button
                  onClick={() => idx < sorted.length - 1 && setSelected(sorted[idx + 1])}
                  disabled={idx === sorted.length - 1}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-25"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                  Siguiente →
                </button>
              </>
            )
          })()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-200 font-black text-base">Diario de JR</h2>
          <p className="text-slate-600 text-xs mt-0.5">{stories.length} capítulo{stories.length !== 1 ? 's' : ''} desbloqueado{stories.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-2xl opacity-60">📖</div>
      </div>

      {/* Chapter list */}
      <div className="flex flex-col gap-2">
        {sorted.map((story, i) => (
          <button key={story.id} onClick={() => setSelected(story)}
            className="relative overflow-hidden rounded-2xl text-left active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg,rgba(245,158,11,0.08) 0%,rgba(9,11,20,0.97) 100%)',
              border: '1px solid rgba(245,158,11,0.18)',
            }}>
            <div className="flex items-center gap-3 p-3.5">
              {/* Chapter number */}
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
                style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
                {story.chapter}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-black text-sm leading-tight truncate">{story.title}</p>
                <p className="text-slate-600 text-[10px] mt-0.5 truncate italic">
                  &ldquo;{story.content.slice(0, 55)}…&rdquo;
                </p>
              </div>
              <span className="text-amber-700 text-sm shrink-0">›</span>
            </div>
            {/* Bottom date */}
            <div className="px-3.5 pb-2.5 -mt-1">
              <p className="text-amber-800 text-[9px]">
                {new Date(story.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
