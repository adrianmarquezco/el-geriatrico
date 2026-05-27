'use client'
import { useState } from 'react'
import { GameEvent, Resident } from '@/lib/types'

const FAMILY_MEMBERS: Record<string, string> = {
  quejica:    'Su hijo Emilio',
  cotilla:    'Su hija Paqui',
  mandón:     'Su yerno',
  devota:     'Su sobrina Concha',
  sordo:      'Su nieto Adrián',
  coqueta:    'Sus dos hijos',
  misterioso: 'Una visita sin identificar',
  exigente:   'Su nuera',
  normal:     'Su familia',
}

interface Choice {
  text: string
  good: boolean
  response: string
  donationMult: number  // 0 = no dona, 1 = normal, 1.5 = extra
}

function getChoices(resident: Resident): Choice[] {
  const name = resident.name.split(' ')[0]
  const h = resident.happiness

  if (h >= 70) {
    return [
      { text: `"${name} está estupendamente, muy bien cuidado/a"`, good: true, response: '¡Qué alegría! Esto merece una propina.', donationMult: 1.5 },
      { text: `"Va bien, sin novedades"`, good: true, response: 'Me alegro. Aquí tiene para el café.', donationMult: 1 },
      { text: `"Ha tenido algún incidente esta semana"`, good: false, response: 'Vaya... Estamos preocupados.', donationMult: 0 },
    ]
  } else if (h >= 40) {
    return [
      { text: `"Estamos trabajando para mejorar su estado"`, good: true, response: 'Gracias por la sinceridad. Confiamos en ustedes.', donationMult: 0.8 },
      { text: `"Está un poco bajo/a de ánimo, es normal a su edad"`, good: false, response: '¿Normal? A ver si mejora, eh.', donationMult: 0 },
      { text: `"Ha habido complicaciones pero ya están resueltas"`, good: true, response: 'Mejor que lo supieran. Cuídenlo bien.', donationMult: 0.5 },
    ]
  } else {
    return [
      { text: `"Ha sido una semana difícil, lo estamos controlando"`, good: true, response: 'Hablaremos con la dirección.', donationMult: 0 },
      { text: `"Todo está bien"`, good: false, response: 'Pues no lo parece. Vamos a pedir el historial.', donationMult: -1 },
      { text: `"Vamos a necesitar refuerzo médico esta semana"`, good: true, response: 'Bien hecho por avisarnos. Mandaremos al médico de familia.', donationMult: 0 },
    ]
  }
}

interface Props {
  event: GameEvent
  resident: Resident
  onResolve: (eventId: string, donationMult: number) => void
  onClose: () => void
  play?: (s: string) => void
}

export default function FamilyVisitDialog({ event, resident, onResolve, onClose, play }: Props) {
  const [chosen, setChosen] = useState<number | null>(null)
  const choices = getChoices(resident)
  const familyMember = FAMILY_MEMBERS[resident.personality] || 'La familia'
  const h = resident.happiness
  const familyMood = h >= 70 ? '😊' : h >= 40 ? '😐' : '😤'

  function pick(i: number) {
    if (chosen !== null) return
    play?.('tap')
    setChosen(i)
    const c = choices[i]
    play?.(c.good ? 'coin' : 'alarm')
  }

  const selectedChoice = chosen !== null ? choices[chosen] : null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-amber-950 border-t-2 border-pink-700/50 rounded-t-3xl p-5 pb-8 animate-bounce-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{familyMood}</div>
          <div className="flex-1">
            <p className="text-pink-300 font-bold text-sm">{familyMember}</p>
            <p className="text-amber-600 text-xs">Visita a {resident.name}</p>
          </div>
          <div className={`badge ${h >= 70 ? 'bg-green-900 text-green-400' : h >= 40 ? 'bg-amber-900 text-amber-400' : 'bg-red-900 text-red-400'}`}>
            {h}% ánimo
          </div>
        </div>

        {/* Family question */}
        <div className="bg-pink-950/40 border border-pink-800/30 rounded-2xl px-4 py-3 mb-4">
          <p className="text-pink-200 text-sm font-semibold">
            "JR, ¿cómo está {resident.name.split(' ')[0]}?"
          </p>
        </div>

        {/* Choices or result */}
        {!selectedChoice ? (
          <div className="flex flex-col gap-2">
            {choices.map((c, i) => (
              <button key={i} onClick={() => pick(i)}
                className="p-3 rounded-xl border border-amber-800/40 bg-amber-900/20 text-left text-amber-300 text-sm font-medium active:scale-98 transition-all hover:border-amber-600">
                {c.text}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className={`rounded-2xl px-4 py-3 mb-4 border ${selectedChoice.good ? 'bg-green-950/40 border-green-700/40' : 'bg-red-950/40 border-red-700/40'}`}>
              <p className={`font-semibold text-sm ${selectedChoice.good ? 'text-green-300' : 'text-red-300'}`}>
                {familyMember}: "{selectedChoice.response}"
              </p>
            </div>
            {selectedChoice.donationMult > 0 ? (
              <p className="text-green-400 text-sm font-bold text-center mb-4">
                💰 +{Math.round(200 * selectedChoice.donationMult * (resident.happiness / 100 + 0.5))}€ de donación
              </p>
            ) : selectedChoice.donationMult < 0 ? (
              <p className="text-red-400 text-sm font-bold text-center mb-4 animate-pulse">
                ⭐ −10 reputación
              </p>
            ) : (
              <p className="text-amber-600 text-sm text-center mb-4">Sin donación esta vez</p>
            )}
            <button
              onClick={() => { play?.('success'); onResolve(event.id, selectedChoice.donationMult) }}
              className="w-full py-3.5 rounded-2xl bg-pink-700 text-white font-bold text-sm active:scale-95 transition-transform"
            >
              Despedir visita
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
