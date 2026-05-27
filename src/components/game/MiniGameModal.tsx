'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { GameEvent, Resident } from '@/lib/types'

type SoundType = 'tap' | 'coin' | 'alarm' | 'success' | 'footstep' | 'levelup' | 'mission'

// ─── Food preferences by personality ──────────────────────────────
const FOOD_PREF: Record<string, number> = {
  quejica: 1, cotilla: 0, mandón: 2, devota: 0,
  sordo: 1, coqueta: 2, misterioso: 1, exigente: 2, normal: 0,
}
const FOODS = [
  { name: 'Cocido madrileño', desc: 'Contundente y caliente', icon: '🥘' },
  { name: 'Sopa de fideos', desc: 'Suave y digestiva', icon: '🍜' },
  { name: 'Merluza a la plancha', desc: 'Ligera y elegante', icon: '🐟' },
]

// ─── TV channels ───────────────────────────────────────────────────
const CHANNELS = [
  { name: 'Fútbol', icon: '⚽', loves: ['quejica', 'mandón'] },
  { name: 'Culebrón', icon: '💃', loves: ['cotilla', 'coqueta'] },
  { name: 'Documentales', icon: '🎬', loves: ['misterioso', 'normal', 'sordo'] },
  { name: 'Misa en TV', icon: '✝️', loves: ['devota'] },
]

// ─── Refusal lines ─────────────────────────────────────────────────
const REFUSALS: Record<string, string[]> = {
  quejica:    ['¡Déjame en paz!', 'No hace falta, estoy bien'],
  mandón:     ['Yo sé lo que me conviene', 'No me mandes tú a mí'],
  devota:     ['Dios proveerá', 'Primero me rezo el rosario'],
  sordo:      ['¿Cómo dices?', '¡Muy bien, gracias!'],
  coqueta:    ['Ahora no, cariño', 'Estoy ocupada'],
  misterioso: ['...', 'Luego'],
  exigente:   ['Primero quiero ver cómo lo hace', 'No me convence'],
  normal:     ['Ahora no', 'Espera un momento'],
  cotilla:    ['Espera que te cuento una cosa antes', 'Un momento...'],
}

type MiniGameType = 'pills' | 'slider' | 'food' | 'remote' | 'refusal'

interface Props {
  event: GameEvent
  resident: Resident
  roomResidents?: Resident[] // for tv_dispute
  onSuccess: () => void
  onClose: () => void
  play?: (s: SoundType) => void
}

export default function MiniGameModal({ event, resident, roomResidents, onSuccess, onClose, play }: Props) {
  const type: MiniGameType = (() => {
    // Random refusal based on personality (25% chance on first attempt for strong personalities)
    const strongPers = ['mandón', 'quejica', 'exigente', 'devota']
    if (strongPers.includes(resident.personality) && Math.random() < 0.3 && event.unresolved_ticks === 0) return 'refusal'
    if (event.type === 'medication') return 'pills'
    if (event.type === 'fallen') return 'slider'
    if (event.type === 'hunger') return 'food'
    if (event.type === 'tv_dispute') return 'remote'
    return 'pills' // fallback
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-amber-950 border-t-2 border-amber-700 rounded-t-3xl p-5 pb-8 animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 bg-amber-600 rounded-full" />
          <div>
            <p className="text-amber-400 font-bold text-sm">{resident.name}</p>
            <p className="text-amber-700 text-xs">{event.type === 'fallen' ? 'se ha caído' : event.type === 'medication' ? 'rechaza la medicación' : event.type === 'hunger' ? 'no ha comido' : 'bronca por la tele'}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-amber-800 text-xl">×</button>
        </div>

        {type === 'refusal'    && <RefusalGame resident={resident} onSuccess={onSuccess} onClose={onClose} play={play} />}
        {type === 'pills'      && <PillsGame resident={resident} onSuccess={onSuccess} play={play} />}
        {type === 'slider'     && <SliderGame resident={resident} onSuccess={onSuccess} play={play} />}
        {type === 'food'       && <FoodGame resident={resident} onSuccess={onSuccess} play={play} />}
        {type === 'remote'     && <RemoteGame residents={roomResidents || [resident]} onSuccess={onSuccess} play={play} />}
      </div>
    </div>
  )
}

// ─── REFUSAL ──────────────────────────────────────────────────────
function RefusalGame({ resident, onSuccess, onClose, play }: { resident: Resident; onSuccess: () => void; onClose: () => void; play?: (s: SoundType) => void }) {
  const lines = REFUSALS[resident.personality] || REFUSALS.normal
  const line = lines[Math.floor(Math.random() * lines.length)]

  return (
    <div className="text-center">
      <div className="text-5xl mb-3 animate-shake">🙅</div>
      <div className="bg-white/10 rounded-2xl px-4 py-3 mb-4 relative">
        <p className="text-amber-200 font-semibold italic">"{line}"</p>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/10" />
      </div>
      <p className="text-amber-600 text-sm mb-4">{resident.name.split(' ')[0]} no quiere cooperar. Inténtalo de nuevo.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-amber-900 text-amber-600 text-sm font-semibold">Dejar</button>
        <button onClick={() => { play?.('tap'); onSuccess() }} className="flex-1 py-3 rounded-xl bg-amber-600 text-amber-950 text-sm font-bold">Insistir</button>
      </div>
    </div>
  )
}

// ─── PILLS ────────────────────────────────────────────────────────
const PILL_COLORS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899']

function PillsGame({ resident, onSuccess, play }: { resident: Resident; onSuccess: () => void; play?: (s: SoundType) => void }) {
  const [timeLeft, setTimeLeft] = useState(6)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [failed, setFailed] = useState(false)
  const correct = useRef<Set<number>>(new Set([
    Math.floor(Math.random() * 6),
    Math.floor(Math.random() * 6),
    (Math.floor(Math.random() * 6)),
  ]))

  // ensure 3 unique correct pills
  while (correct.current.size < 3) {
    correct.current.add(Math.floor(Math.random() * 6))
  }

  useEffect(() => {
    if (failed || timeLeft === 0) return
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { setFailed(true); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [failed])

  function tap(i: number) {
    if (failed) return
    play?.('tap')
    const next = new Set(selected)
    if (next.has(i)) { next.delete(i) } else { next.add(i) }
    setSelected(next)
    if (next.size === 3) {
      const ok = Array.from(next).every(n => correct.current.has(n))
      if (ok) { play?.('success'); setTimeout(onSuccess, 400) }
      else { play?.('alarm'); setFailed(true); setSelected(new Set()) }
    }
  }

  return (
    <div className="text-center">
      <p className="text-amber-300 font-bold mb-1">Selecciona las 3 pastillas correctas</p>
      <p className="text-amber-700 text-xs mb-4">Las marcadas en verde son las buenas</p>

      <div className="flex justify-center gap-2 mb-5 flex-wrap">
        {PILL_COLORS.map((color, i) => {
          const isSel = selected.has(i)
          const isCorrect = correct.current.has(i)
          const showHint = failed
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              disabled={failed && !showHint}
              className="w-14 h-14 rounded-full text-2xl transition-all active:scale-90 border-4 flex items-center justify-center"
              style={{
                background: showHint ? (isCorrect ? '#166534' : '#1a0000') : isSel ? color : '#1a1a2e',
                borderColor: showHint ? (isCorrect ? '#22c55e' : '#7f1d1d') : isSel ? color : '#374151',
                boxShadow: isSel ? `0 0 12px ${color}80` : 'none',
              }}
            >
              💊
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-amber-600 text-xs">{3 - selected.size} por seleccionar</span>
        <span className={`font-bold text-sm ${timeLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
          {failed ? (timeLeft === 0 ? '⏰ Tiempo' : '❌ Error') : `⏱ ${timeLeft}s`}
        </span>
      </div>

      {failed && (
        <button onClick={() => { setFailed(false); setTimeLeft(6); setSelected(new Set()) }}
          className="w-full py-3 rounded-xl bg-amber-600 text-amber-950 font-bold text-sm">
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

// ─── SLIDER ──────────────────────────────────────────────────────
function SliderGame({ resident, onSuccess, play }: { resident: Resident; onSuccess: () => void; play?: (s: SoundType) => void }) {
  const [pos, setPos] = useState(0)
  const [result, setResult] = useState<'success' | 'fail' | null>(null)
  const animRef = useRef<number>()
  const speed = resident.happiness < 30 ? 2.2 : 1.5

  useEffect(() => {
    let p = 0; let dir = 1
    const step = () => {
      p += dir * speed
      if (p >= 100) { p = 100; dir = -1 }
      if (p <= 0)   { p = 0;   dir = 1 }
      setPos(p)
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current!)
  }, [speed])

  function tap() {
    cancelAnimationFrame(animRef.current!)
    const ok = pos >= 35 && pos <= 65
    setResult(ok ? 'success' : 'fail')
    play?.(ok ? 'success' : 'alarm')
    if (ok) setTimeout(onSuccess, 600)
  }

  const isGreen = pos >= 35 && pos <= 65

  return (
    <div className="text-center">
      <div className="text-4xl mb-2 animate-idle">{resident.happiness < 30 ? '😱' : '😣'}</div>
      <p className="text-amber-300 font-bold mb-1">Levanta a {resident.name.split(' ')[0]}</p>
      <p className="text-amber-700 text-xs mb-5">Toca cuando la barra esté en la zona verde</p>

      <div className="relative h-8 bg-amber-900/60 rounded-full mb-2 overflow-hidden mx-2">
        {/* Green zone */}
        <div className="absolute top-0 h-full bg-green-700/50 rounded-full" style={{ left: '35%', width: '30%' }} />
        {/* Needle */}
        <div className="absolute top-1 bottom-1 w-3 rounded-full transition-none"
          style={{ left: `calc(${pos}% - 6px)`, background: isGreen ? '#22c55e' : '#f59e0b', boxShadow: `0 0 8px ${isGreen ? '#22c55e' : '#f59e0b'}` }} />
      </div>
      <p className="text-amber-800 text-[10px] mb-4">← zona verde: centro →</p>

      {!result ? (
        <button onClick={tap} className="w-full py-4 rounded-xl bg-amber-600 text-amber-950 font-bold text-lg active:scale-95 transition-transform">
          ¡Ahora!
        </button>
      ) : result === 'success' ? (
        <div className="py-3 rounded-xl bg-green-800 text-green-300 font-bold">¡Perfecto! 💪</div>
      ) : (
        <div>
          <div className="py-2 rounded-xl bg-red-900 text-red-300 font-bold mb-3">Demasiado brusco 😬</div>
          <button onClick={() => { setResult(null); setPos(0) }} className="w-full py-3 rounded-xl bg-amber-600 text-amber-950 font-bold text-sm">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

// ─── FOOD ─────────────────────────────────────────────────────────
function FoodGame({ resident, onSuccess, play }: { resident: Resident; onSuccess: () => void; play?: (s: SoundType) => void }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const correctIdx = FOOD_PREF[resident.personality] ?? 0

  function pick(i: number) {
    if (chosen !== null) return
    play?.('tap')
    setChosen(i)
    if (i === correctIdx) { play?.('success'); setTimeout(onSuccess, 800) }
    else play?.('alarm')
  }

  return (
    <div>
      <p className="text-amber-300 font-bold text-center mb-1">¿Qué quiere comer {resident.name.split(' ')[0]}?</p>
      <p className="text-amber-700 text-xs text-center mb-4 italic">"{resident.tagline}"</p>
      <div className="flex flex-col gap-2">
        {FOODS.map((f, i) => {
          const isChosen = chosen === i
          const isCorrect = i === correctIdx
          const showResult = chosen !== null
          return (
            <button key={i} onClick={() => pick(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-98 ${
                showResult
                  ? isCorrect ? 'border-green-500 bg-green-950/50' : isChosen ? 'border-red-600 bg-red-950/50' : 'border-amber-900/30 opacity-40'
                  : 'border-amber-800/40 bg-amber-900/20 hover:border-amber-600'
              }`}>
              <span className="text-3xl">{f.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-amber-200 font-semibold text-sm">{f.name}</p>
                <p className="text-amber-700 text-xs">{f.desc}</p>
              </div>
              {showResult && isCorrect && <span className="text-green-400 text-lg">✓</span>}
              {showResult && isChosen && !isCorrect && <span className="text-red-400 text-lg">✗</span>}
            </button>
          )
        })}
      </div>
      {chosen !== null && chosen !== correctIdx && (
        <button onClick={() => setChosen(null)} className="w-full mt-3 py-3 rounded-xl bg-amber-600 text-amber-950 font-bold text-sm">
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}

// ─── REMOTE ───────────────────────────────────────────────────────
function RemoteGame({ residents, onSuccess, play }: { residents: Resident[]; onSuccess: () => void; play?: (s: SoundType) => void }) {
  const [chosen, setChosen] = useState<number | null>(null)

  function getBestChannel() {
    return CHANNELS.reduce((best, ch, i) => {
      const score = residents.filter(r => ch.loves.includes(r.personality)).length
      return score > best.score ? { idx: i, score } : best
    }, { idx: 0, score: -1 }).idx
  }

  const bestIdx = getBestChannel()

  function pick(i: number) {
    if (chosen !== null) return
    play?.('tap')
    setChosen(i)
    const score = residents.filter(r => CHANNELS[i].loves.includes(r.personality)).length
    if (i === bestIdx) { play?.('success'); setTimeout(onSuccess, 800) }
    else play?.(score > 0 ? 'coin' : 'alarm')
  }

  return (
    <div>
      <p className="text-amber-300 font-bold text-center mb-1">¿Qué canal ponemos?</p>
      <p className="text-amber-700 text-xs text-center mb-3">
        En la sala: {residents.map(r => r.name.split(' ')[0]).join(', ')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {CHANNELS.map((ch, i) => {
          const score = residents.filter(r => ch.loves.includes(r.personality)).length
          const isChosen = chosen === i
          const isCorrect = i === bestIdx
          const showResult = chosen !== null
          return (
            <button key={i} onClick={() => pick(i)}
              className={`p-3 rounded-xl border-2 text-center transition-all active:scale-95 ${
                showResult
                  ? isCorrect ? 'border-green-500 bg-green-950/50' : isChosen ? 'border-red-700 bg-red-950/40' : 'border-amber-900/20 opacity-40'
                  : 'border-amber-800/40 bg-amber-900/20'
              }`}>
              <div className="text-3xl mb-1">{ch.icon}</div>
              <p className="text-amber-200 text-xs font-semibold">{ch.name}</p>
              {showResult && <p className="text-amber-600 text-[10px] mt-0.5">{score} {'⭐'.repeat(score)}</p>}
            </button>
          )
        })}
      </div>
      {chosen !== null && chosen !== bestIdx && (
        <div className="mt-3">
          <p className="text-amber-600 text-xs text-center mb-2">
            {residents.filter(r => CHANNELS[chosen].loves.includes(r.personality)).length > 0
              ? 'No es el mejor canal, pero algo es algo...'
              : 'Nadie quiere ver eso. Siguen peleando.'}
          </p>
          <button onClick={() => setChosen(null)} className="w-full py-3 rounded-xl bg-amber-600 text-amber-950 font-bold text-sm">
            Cambiar de canal
          </button>
        </div>
      )}
    </div>
  )
}
