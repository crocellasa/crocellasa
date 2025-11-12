/**
 * Admin Dashboard - Bookings List
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requireAdminAuth, logoutAdmin } from '@/lib/admin/auth'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  checkin_date: string
  checkout_date: string
  num_guests: number
  status: string
  guest_token: string | null
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check auth
    if (!requireAdminAuth()) return

    // Fetch bookings from API
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // For now, we'll fetch from Supabase directly
      // In production, add a proper admin API endpoint
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setError('Supabase configuration missing')
        setLoading(false)
        return
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/bookings?order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Errore nel caricamento delle prenotazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    router.push('/admin/login')
  }

  const generateToken = async (bookingId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(
        `${apiUrl}/api/bookings/${bookingId}/generate-token`
      )

      if (!response.ok) {
        throw new Error('Failed to generate token')
      }

      const data = await response.json()

      // Copy portal URL to clipboard
      navigator.clipboard.writeText(data.portal_url)
      alert(`Token generato e URL copiato!\n\n${data.portal_url}`)

      // Refresh bookings
      fetchBookings()
    } catch (err) {
      console.error('Error generating token:', err)
      alert('Errore nella generazione del token')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-alcova-gold mx-auto mb-4"></div>
          <p className="text-alcova-charcoal">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-serif text-alcova-navy">
            Alcova Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-alcova-charcoal hover:text-alcova-navy transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Totale Prenotazioni</p>
            <p className="text-3xl font-bold text-alcova-navy">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Confermate</p>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Check-in Oggi</p>
            <p className="text-3xl font-bold text-blue-600">
              {bookings.filter(b =>
                new Date(b.checkin_date).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Check-out Oggi</p>
            <p className="text-3xl font-bold text-orange-600">
              {bookings.filter(b =>
                new Date(b.checkout_date).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-alcova-navy">
              Prenotazioni Recenti
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ospite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ospiti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.guest_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.guest_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.checkin_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.checkout_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.num_guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {booking.guest_token ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/api/guests/${booking.guest_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-alcova-gold hover:text-alcova-brass mr-3"
                        >
                          Vedi Portal
                        </a>
                      ) : (
                        <button
                          onClick={() => generateToken(booking.id)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Genera Token
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nessuna prenotazione trovata</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
