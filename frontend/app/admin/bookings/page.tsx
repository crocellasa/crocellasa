'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Calendar, User, MapPin, MoreVertical, Eye, XCircle, Send } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  hospitable_id?: string
  smoobu_id?: string
  confirmation_code?: string
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_language: 'en',
    confirmation_code: '',
    smoobu_id: '',
    checkin_date: '',
    checkout_date: '',
    num_guests: 1
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        console.error('Failed to fetch bookings:', response.statusText)
        setBookings([])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Booking created:', data)

        // Close modal and reset form
        setShowCreateModal(false)
        setFormData({
          guest_name: '',
          guest_email: '',
          guest_phone: '',
          guest_language: 'en',
          confirmation_code: '',
          smoobu_id: '',
          checkin_date: '',
          checkout_date: '',
          num_guests: 1
        })

        // Refresh bookings list
        await fetchBookings()

        alert('Booking created successfully! Access codes have been sent to the guest.')
      } else {
        const error = await response.json()
        alert(`Failed to create booking: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.confirmation_code && booking.confirmation_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.smoobu_id && booking.smoobu_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.hospitable_id && booking.hospitable_id.toLowerCase().includes(searchQuery.toLowerCase()))

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
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

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-glass-border">
              <h2 className="text-2xl font-light text-mono-900">Create Manual Booking</h2>
              <p className="text-sm text-mono-500 mt-1 font-light">
                Create a new booking and generate access codes automatically
              </p>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-sm font-medium text-mono-700 mb-4 uppercase tracking-wider">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Guest Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.guest_email}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                      placeholder="guest@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                      placeholder="+393331234567"
                    />
                    <p className="text-xs text-mono-400 mt-1">E.164 format (e.g., +393331234567)</p>
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Language
                    </label>
                    <select
                      value={formData.guest_language}
                      onChange={(e) => setFormData({ ...formData, guest_language: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                    >
                      <option value="en">English</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-sm font-medium text-mono-700 mb-4 uppercase tracking-wider">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Check-in Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.checkin_date}
                      onChange={(e) => setFormData({ ...formData, checkin_date: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Check-out Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.checkout_date}
                      onChange={(e) => setFormData({ ...formData, checkout_date: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={formData.num_guests}
                      onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Confirmation Code
                    </label>
                    <input
                      type="text"
                      value={formData.confirmation_code}
                      onChange={(e) => setFormData({ ...formData, confirmation_code: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-mono-600 mb-1.5 font-light">
                      Smoobu ID
                    </label>
                    <input
                      type="text"
                      value={formData.smoobu_id}
                      onChange={(e) => setFormData({ ...formData, smoobu_id: e.target.value })}
                      className="w-full px-3 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-sm font-light text-mono-900"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-4 py-2 text-sm font-light text-mono-600 hover:text-mono-900 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
