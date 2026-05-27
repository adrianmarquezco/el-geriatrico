import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/game')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <div className="text-8xl mb-4">🏠</div>
        <h1 className="text-4xl font-bold text-amber-300 mb-2">El Geriátrico</h1>
        <p className="text-amber-500 text-lg">Gestiona tu residencia</p>
      </div>

      <p className="text-amber-300/70 max-w-sm mb-10 text-sm leading-relaxed">
        Sé JR, el cuidador. Cuida a tus ancianos, resuelve urgencias, amplía tu residencia y conviértete en la referencia del barrio.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/register" className="btn-primary text-center py-3 text-base">
          Empezar a jugar
        </Link>
        <Link href="/login" className="btn-secondary text-center py-3 text-base">
          Ya tengo cuenta
        </Link>
      </div>
    </main>
  )
}
