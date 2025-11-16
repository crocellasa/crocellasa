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
    <div className="card">
      <h2 className="text-2xl font-serif text-alcova-navy mb-4">
        {locale === 'it' ? 'Apri Portone' : 'Open Main Door'}
      </h2>

      <p className="text-alcova-charcoal text-sm mb-4">
        {locale === 'it'
          ? 'Premi il pulsante per aprire il portone principale da remoto.'
          : 'Press the button to open the main entrance remotely.'}
      </p>

      <button
        onClick={handleOpen}
        disabled={loading}
        className={`w-full btn-primary flex items-center justify-center gap-2 ${
          success ? 'bg-green-600 hover:bg-green-700' : ''
        } ${
          error ? 'bg-red-600 hover:bg-red-700' : ''
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {locale === 'it' ? 'Apertura...' : 'Opening...'}
          </>
        ) : success ? (
          <>
            <DoorOpen className="w-5 h-5" />
            {locale === 'it' ? 'Portone aperto! ✓' : 'Door opened! ✓'}
          </>
        ) : error ? (
          <>
            {locale === 'it' ? 'Errore ✗' : 'Error ✗'}
          </>
        ) : (
          <>
            <DoorOpen className="w-5 h-5" />
            {locale === 'it' ? 'Apri Portone' : 'Open Door'}
          </>
        )}
      </button>
    </div>
  )
}
