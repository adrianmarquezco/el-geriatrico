'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-5xl mb-6">🏠</div>
      <h1 className="text-2xl font-bold text-amber-300 mb-2">Empieza tu residencia</h1>
      <p className="text-amber-600 text-sm mb-8">JR necesita un cuidador. Ese eres tú.</p>

      <form onSubmit={handleRegister} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          className="bg-amber-900/40 border border-amber-800 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-600 focus:outline-none focus:border-amber-500"
        />
        <input
          type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={6}
          className="bg-amber-900/40 border border-amber-800 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-600 focus:outline-none focus:border-amber-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary py-3">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-amber-600 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-amber-400 underline">Inicia sesión</Link>
      </p>
    </main>
  )
}
