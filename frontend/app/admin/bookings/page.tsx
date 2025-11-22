'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Calendar, User, MapPin, MoreVertical, Eye, XCircle, Send } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  hospitable_id: string
  confirmation_code: string
  guest_name: string
  guest_email: string
  guest_phone: string
  property_id: string
  checkin_date: string
  checkout_date: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  created_at: string
  access_codes_count: number
}

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-green-100 text-green-700',
  checked_out: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        // Mock data for development
        setBookings([
          {
            id: '1',
            hospitable_id: 'HOSP-12345',
            confirmation_code: 'ABC123',
            guest_name: 'Marco Rossi',
            guest_email: 'marco.rossi@example.com',
            guest_phone: '+39 123 456 7890',
            property_id: 'alcova_landolina_fi',
            checkin_date: '2025-12-15T15:00:00Z',
            checkout_date: '2025-12-18T11:00:00Z',
            status: 'confirmed',
            created_at: '2025-12-01T10:00:00Z',
            access_codes_count: 3,
          },
          {
            id: '2',
            hospitable_id: 'HOSP-12346',
            confirmation_code: 'DEF456',
            guest_name: 'Sarah Johnson',
            guest_email: 'sarah.j@example.com',
            guest_phone: '+1 555 123 4567',
            property_id: 'alcova_landolina_fi',
            checkin_date: '2025-12-20T15:00:00Z',
            checkout_date: '2025-12-23T11:00:00Z',
            status: 'confirmed',
            created_at: '2025-12-02T14:30:00Z',
            access_codes_count: 3,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.confirmation_code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-mono-900 tracking-tight">Bookings</h1>
          <p className="text-sm text-mono-500 mt-1 font-light">
            Manage all your property bookings and access codes
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Create Manual Booking
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mono-400" />
            <input
              type="text"
              placeholder="Search by guest name, email, or confirmation code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900 placeholder-mono-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-mono-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-900 mx-auto"></div>
            <p className="text-mono-500 mt-4 font-light">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-mono-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-light">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-glass-surface/50 border-b border-glass-border">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Check-In / Check-Out
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Access Codes
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-medium text-mono-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-glass-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-mono-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-mono-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-mono-900">{booking.guest_name}</p>
                          <p className="text-xs text-mono-500 font-light">{booking.guest_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-mono-600 font-light">
                        <MapPin className="w-3 h-3 text-mono-400" />
                        Via Landolina #186
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-light">
                        <p className="text-mono-900">
                          {format(new Date(booking.checkin_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-mono-400 text-xs">
                          {format(new Date(booking.checkout_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          booking.status === 'checked_in' ? 'bg-green-50 text-green-700 border-green-100' :
                            booking.status === 'checked_out' ? 'bg-mono-50 text-mono-700 border-mono-100' :
                              'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                          <span className="text-[10px] font-medium text-green-700">{booking.access_codes_count}</span>
                        </div>
                        <span className="text-xs text-mono-500 font-light">active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 hover:bg-glass-surface rounded-lg transition-colors text-mono-400 hover:text-mono-900"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-glass-surface rounded-lg transition-colors text-mono-400 hover:text-mono-900"
                          title="Resend notification"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-mono-400 hover:text-red-600"
                            title="Cancel booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
