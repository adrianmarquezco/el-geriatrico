'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/game')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-5xl mb-6">🏠</div>
      <h1 className="text-2xl font-bold text-amber-300 mb-8">Bienvenido de vuelta</h1>

      <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          className="bg-amber-900/40 border border-amber-800 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-600 focus:outline-none focus:border-amber-500"
        />
        <input
          type="password" placeholder="Contraseña" value={password}
          onChange={e => setPassword(e.target.value)} required
          className="bg-amber-900/40 border border-amber-800 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-600 focus:outline-none focus:border-amber-500"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary py-3">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-amber-600 text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-amber-400 underline">Regístrate</Link>
      </p>
    </main>
  )
}
