'use client'
import { Toast } from '@/lib/types'

const TOAST_STYLES: Record<string, string> = {
  xp:      'bg-purple-600 text-white',
  money:   'bg-green-600 text-white',
  warning: 'bg-red-600 text-white',
  success: 'bg-amber-500 text-amber-950',
  new:     'bg-blue-600 text-white',
  story:   'bg-amber-800 text-amber-100',
  mission: 'bg-yellow-500 text-yellow-950',
}

interface Props {
  toasts: Toast[]
}

export default function ToastContainer({ toasts }: Props) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-xs px-4">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${TOAST_STYLES[t.type] || 'bg-amber-700 text-white'} px-4 py-2 rounded-xl text-sm font-semibold text-center shadow-lg animate-bounce-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
