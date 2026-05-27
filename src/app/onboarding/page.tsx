'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: residence } = await supabase
      .from('residences')
      .insert({
        user_id: user.id,
        name: name || 'Mi Geriátrico',
        level: 1,
        reputation: 50,
        money: 5000,
        jr_energy: 100,
        jr_experience: 0,
      })
      .select('id')
      .single()

    if (residence) {
      await supabase.rpc('seed_initial_residents', { p_residence_id: residence.id })
    }

    router.push('/game')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🏗️</div>
      <h1 className="text-2xl font-bold text-amber-300 mb-2">Bienvenido, JR</h1>
      <p className="text-amber-500 text-sm mb-8 max-w-xs">
        Has heredado una residencia en un estado bastante... mejorable. Dos ancianos te esperan. Empieza por darle un nombre.
      </p>

      <form onSubmit={handleStart} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nombre de tu residencia"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          className="bg-amber-900/40 border border-amber-800 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-600 focus:outline-none focus:border-amber-500 text-center"
        />
        <button type="submit" disabled={loading} className="btn-primary py-3">
          {loading ? 'Abriendo las puertas...' : 'Abrir la residencia'}
        </button>
      </form>
    </main>
  )
}
