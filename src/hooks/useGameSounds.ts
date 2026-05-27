'use client'
import { useCallback, useRef } from 'react'

type SoundType = 'tap' | 'coin' | 'alarm' | 'success' | 'footstep' | 'levelup' | 'mission'

// Generate simple beep sounds using Web Audio API
function createAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch { return null }
}

function playTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(true)

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = createAudioCtx()
    return ctxRef.current
  }

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return
    const ctx = getCtx()
    if (!ctx) return
    try {
      switch (sound) {
        case 'tap':
          playTone(ctx, 800, 0.08, 'sine', 0.2)
          break
        case 'coin':
          playTone(ctx, 1200, 0.1, 'sine', 0.25)
          setTimeout(() => playTone(ctx, 1600, 0.15, 'sine', 0.2), 80)
          break
        case 'alarm':
          playTone(ctx, 440, 0.2, 'square', 0.15)
          setTimeout(() => playTone(ctx, 380, 0.2, 'square', 0.15), 220)
          break
        case 'success':
          playTone(ctx, 523, 0.1, 'sine', 0.2)
          setTimeout(() => playTone(ctx, 659, 0.1, 'sine', 0.2), 100)
          setTimeout(() => playTone(ctx, 784, 0.2, 'sine', 0.2), 200)
          break
        case 'footstep':
          playTone(ctx, 200, 0.05, 'triangle', 0.1)
          break
        case 'levelup':
          [523, 659, 784, 1047].forEach((f, i) =>
            setTimeout(() => playTone(ctx, f, 0.15, 'sine', 0.25), i * 120))
          break
        case 'mission':
          playTone(ctx, 659, 0.1, 'sine', 0.2)
          setTimeout(() => playTone(ctx, 784, 0.1, 'sine', 0.2), 120)
          setTimeout(() => playTone(ctx, 1047, 0.25, 'sine', 0.2), 240)
          break
      }
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current
    return enabledRef.current
  }, [])

  return { play, toggle, enabled: enabledRef }
}
