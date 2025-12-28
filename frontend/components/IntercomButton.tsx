/**
 * Ring Intercom button component
 */
'use client'

import { useState } from 'react'
import { DoorOpen, Loader2 } from 'lucide-react'

interface IntercomButtonProps {
  bookingId: string
  locale: 'it' | 'en'
}

export default function IntercomButton({ bookingId, locale }: IntercomButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const handleOpen = async () => {
    setLoading(true)
    setSuccess(false)
    setError(false)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/intercom/open?booking_id=${bookingId}`, {
        method: 'POST',
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(true)
        setTimeout(() => setError(false), 3000)
      }
    } catch (err) {
      console.error('Failed to open intercom:', err)
      setError(true)
      setTimeout(() => setError(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card flex flex-col items-center text-center ring-1 ring-brand-brass/5">
      <h2 className="text-3xl font-serif text-brand-midnight mb-3">
        {locale === 'it' ? 'Ingresso Principale' : 'Main Entrance'}
      </h2>

      <p className="text-brand-midnight/60 text-sm mb-8 max-w-sm mx-auto italic">
        {locale === 'it'
          ? 'Tocca il pulsante dorato per sbloccare il portone dell\'edificio.'
          : 'Tap the golden button to unlock the building entrance door.'}
      </p>

      <button
        onClick={handleOpen}
        disabled={loading}
        className={`w-full max-w-md btn-brass flex items-center justify-center gap-3 h-16 text-xl tracking-wide ${success ? 'opacity-90 grayscale-0' : ''
          } ${error ? 'bg-red-600 grayscale-0' : ''
          } disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            {locale === 'it' ? 'Sblocco in corso...' : 'Unlocking...'}
          </>
        ) : success ? (
          <>
            <DoorOpen className="w-6 h-6" />
            {locale === 'it' ? 'Sbloccato! ✓' : 'Unlocked! ✓'}
          </>
        ) : error ? (
          <>
            {locale === 'it' ? 'Riprova ✗' : 'Try again ✗'}
          </>
        ) : (
          <>
            <DoorOpen className="w-6 h-6" />
            {locale === 'it' ? 'Apri Portone' : 'Open Gate'}
          </>
        )}
      </button>

      {success && (
        <p className="mt-4 text-xs text-brand-brass animate-pulse font-medium">
          {locale === 'it' ? 'Portone aperto. Benvenuto!' : 'Door unlocked. Welcome!'}
        </p>
      )}
    </div>
  )
}
