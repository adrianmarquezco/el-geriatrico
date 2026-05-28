'use client'
import { useState } from 'react'

interface Props {
  residenceName: string
  onComplete: () => void
}

const STEPS = [
  {
    emoji: '👋',
    speaker: 'Don Arturo',
    speakerDesc: 'Tu primer residente',
    text: '¡Hola! Soy Don Arturo, el primero en llegar a esta residencia. JR, me alegra tenerte como auxiliar.',
    action: 'Encantado, Don Arturo',
    bg: 'from-amber-950 to-amber-900',
    hint: null,
  },
  {
    emoji: '🏗️',
    speaker: 'Don Arturo',
    speakerDesc: 'Un poco exigente...',
    text: 'Lo primero: necesito una habitación decente. Ve a Obras y construye habitaciones. Sin habitación no hay residentes.',
    action: 'Entendido',
    bg: 'from-amber-950 to-stone-900',
    hint: '👉 Toca la pestaña Obras (🔨) para construir',
  },
  {
    emoji: '⚠️',
    speaker: 'Don Arturo',
    speakerDesc: 'Poniéndose serio',
    text: 'A veces necesitaré cosas: medicación, comida, compañía... Cuando veas una alerta roja sobre mi habitación, ¡tócala rápido!',
    action: 'Cuenta conmigo',
    bg: 'from-red-950 to-amber-950',
    hint: '🔴 Los puntos rojos sobre las salas son urgencias',
  },
  {
    emoji: '💰',
    speaker: 'Don Arturo',
    speakerDesc: 'Hablando de negocios',
    text: 'Si me tienes contento, la familia paga puntualmente. Si no... se quejarán. Y las inspecciones sanitarias son cada 7 días.',
    action: 'Lo tendré en cuenta',
    bg: 'from-amber-950 to-green-950',
    hint: '💝 Ánimo alto = más ingresos + donaciones familiares',
  },
  {
    emoji: '🏆',
    speaker: 'Don Arturo',
    speakerDesc: 'Con una sonrisa',
    text: '¡Espero que hagas de esta la mejor residencia de España! Tengo fe en ti, JR. Ahora, ¿a trabajar?',
    action: '¡Vamos allá! 🚀',
    bg: 'from-amber-950 to-amber-900',
    hint: null,
  },
]

export default function OnboardingFlow({ residenceName, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-end bg-black/85 backdrop-blur-sm px-4 pb-8">
      {/* Background scene hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="text-9xl">🏠</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-amber-400' : i < step ? 'w-2 bg-amber-600' : 'w-2 bg-amber-900'}`} />
        ))}
      </div>

      {/* Card */}
      <div className={`w-full max-w-md bg-gradient-to-b ${current.bg} rounded-3xl overflow-hidden border border-amber-700/40 animate-bounce-in`}>
        {/* Speaker */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-900/60 border border-amber-700/40 flex items-center justify-center text-2xl">
            {current.emoji}
          </div>
          <div>
            <p className="text-amber-200 font-bold text-sm">{current.speaker}</p>
            <p className="text-amber-600 text-xs">{current.speakerDesc}</p>
          </div>
          <div className="ml-auto text-amber-800 text-xs">{step + 1}/{STEPS.length}</div>
        </div>

        {/* Speech bubble */}
        <div className="mx-4 mb-3 bg-amber-100/10 border border-amber-700/30 rounded-2xl px-4 py-3">
          <p className="text-amber-200 text-sm leading-relaxed">"{current.text}"</p>
        </div>

        {/* Hint */}
        {current.hint && (
          <div className="mx-4 mb-3 bg-blue-950/40 border border-blue-800/30 rounded-xl px-3 py-2">
            <p className="text-blue-300 text-xs">{current.hint}</p>
          </div>
        )}

        {/* Residence name badge (first step only) */}
        {step === 0 && (
          <div className="mx-4 mb-3 text-center">
            <p className="text-amber-700 text-xs">Bienvenido a</p>
            <p className="text-amber-300 font-bold">{residenceName}</p>
          </div>
        )}

        {/* Action button */}
        <div className="px-4 pb-5">
          <button
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 ${isLast ? 'bg-amber-400 text-amber-950' : 'bg-amber-700 text-amber-100'}`}
          >
            {current.action}
          </button>
        </div>
      </div>

      {/* Skip */}
      {!isLast && (
        <button onClick={onComplete} className="mt-3 text-amber-800 text-xs">
          Saltar tutorial
        </button>
      )}
    </div>
  )
}
