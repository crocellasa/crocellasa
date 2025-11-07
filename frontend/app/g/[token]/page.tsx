/**
 * Guest Portal Page
 * Main page for guests to view their access codes and property info
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import GuestHeader from '@/components/GuestHeader'
import AccessCodes from '@/components/AccessCodes'
import PropertyInfo from '@/components/PropertyInfo'
import IntercomButton from '@/components/IntercomButton'
import HouseRules from '@/components/HouseRules'
import LoadingSpinner from '@/components/LoadingSpinner'

interface GuestData {
  booking: {
    id: string
    guest_name: string
    guest_email: string
    guest_language: string
    checkin_date: string
    checkout_date: string
    num_guests: number
    status: string
  }
  access_codes: Array<{
    lock_type: string
    code: string
    valid_from: string
    valid_until: string
    display_name_it?: string
    display_name_en?: string
  }>
  property: {
    name: string
    address: string
    city: string
    latitude: number
    longitude: number
    wifi_ssid?: string
    wifi_password?: string
    checkin_instructions_it?: string
    checkin_instructions_en?: string
    house_rules_it?: string
    house_rules_en?: string
  } | null
}

export default function GuestPortalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const locale = (searchParams.get('lang') || 'en') as 'it' | 'en'

  const [data, setData] = useState<GuestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGuestData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/guests/${token}`)

        if (!response.ok) {
          if (response.status === 401) {
            setError('invalid_token')
          } else if (response.status === 403) {
            setError('booking_cancelled')
          } else {
            setError('unknown_error')
          }
          return
        }

        const guestData = await response.json()
        setData(guestData)
      } catch (err) {
        console.error('Failed to fetch guest data:', err)
        setError('network_error')
      } finally {
        setLoading(false)
      }
    }

    fetchGuestData()
  }, [token])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-alcova-navy mb-4">
            {locale === 'it' ? 'Link non valido' : 'Invalid Link'}
          </h1>
          <p className="text-alcova-charcoal">
            {locale === 'it'
              ? 'Questo link non è valido o è scaduto. Contatta il tuo host.'
              : 'This link is invalid or expired. Please contact your host.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alcova-ivory">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <GuestHeader
          guestName={data.booking.guest_name}
          checkinDate={data.booking.checkin_date}
          checkoutDate={data.booking.checkout_date}
          numGuests={data.booking.num_guests}
          locale={locale}
        />

        <AccessCodes
          codes={data.access_codes}
          locale={locale}
        />

        {data.property && (
          <>
            <PropertyInfo
              property={data.property}
              locale={locale}
            />

            <IntercomButton
              bookingId={data.booking.id}
              locale={locale}
            />

            <HouseRules
              rules={locale === 'it' ? data.property.house_rules_it : data.property.house_rules_en}
              locale={locale}
            />
          </>
        )}

        <div className="text-center text-sm text-alcova-charcoal/70 pt-8">
          <p>
            {locale === 'it'
              ? 'Hai bisogno di aiuto?'
              : 'Need help?'}
          </p>
          <a
            href={`mailto:${data.booking.guest_email}`}
            className="text-alcova-gold hover:text-alcova-brass"
          >
            {locale === 'it' ? 'Contatta il tuo host' : 'Contact your host'}
          </a>
        </div>
      </div>
    </div>
  )
}
