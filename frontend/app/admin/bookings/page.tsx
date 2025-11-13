'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Calendar, User, MapPin, MoreVertical, Eye, XCircle, Send, X, AlertCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fetchWithAuth } from '@/lib/auth'

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

interface BookingDetails {
  booking: Booking
  access_codes: any[]
  activity_logs: any[]
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
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        throw new Error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      showNotification('error', 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedBooking(data)
        setShowDetailsModal(true)
      } else {
        throw new Error('Failed to fetch booking details')
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error)
      showNotification('error', 'Failed to load booking details')
    }
  }

  const handleResendNotification = async (bookingId: string) => {
    if (!confirm('Resend notification to guest?')) return

    setActionLoading(true)
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings/${bookingId}/resend-notification`,
        { method: 'POST' }
      )

      if (response.ok) {
        showNotification('success', 'Notification sent successfully')
      } else {
        throw new Error('Failed to resend notification')
      }
    } catch (error) {
      console.error('Failed to resend notification:', error)
      showNotification('error', 'Failed to send notification')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? All access codes will be revoked.')) return

    setActionLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/cancel`,
        { method: 'POST' }
      )

      if (response.ok) {
        showNotification('success', 'Booking cancelled successfully')
        fetchBookings() // Refresh list
      } else {
        throw new Error('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      showNotification('error', 'Failed to cancel booking')
    } finally {
      setActionLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
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
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all your property bookings and access codes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Create Manual Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name, email, or confirmation code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In / Check-Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Codes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.guest_name}</p>
                          <p className="text-xs text-gray-500">{booking.guest_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Via Landolina #186
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">
                          {format(new Date(booking.checkin_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-gray-500">
                          {format(new Date(booking.checkout_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[booking.status]}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-green-700">{booking.access_codes_count}</span>
                        </div>
                        <span className="text-sm text-gray-600">codes active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchBookingDetails(booking.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                          disabled={actionLoading}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleResendNotification(booking.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Resend notification"
                          disabled={actionLoading}
                        >
                          <Send className="w-4 h-4 text-gray-600" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel booking"
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
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
        <CreateBookingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchBookings()
            showNotification('success', 'Booking created successfully')
          }}
          onError={(message) => showNotification('error', message)}
        />
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedBooking(null)
          }}
        />
      )}
    </div>
  )
}

// Create Booking Modal Component
function CreateBookingModal({ onClose, onSuccess, onError }: {
  onClose: () => void
  onSuccess: () => void
  onError: (message: string) => void
}) {
  const [formData, setFormData] = useState({
    hospitable_id: '',
    confirmation_code: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_language: 'en',
    property_id: 'alcova_landolina_fi',
    checkin_date: '',
    checkout_date: '',
    num_guests: 2,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format dates for API
      const payload = {
        ...formData,
        checkin_date: new Date(formData.checkin_date).toISOString(),
        checkout_date: new Date(formData.checkout_date).toISOString(),
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
      onError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create Manual Booking</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.guest_email}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mario@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone * (with country code)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guest_phone}
                  onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+393331234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={formData.guest_language}
                  onChange={(e) => setFormData({ ...formData, guest_language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.num_guests}
                  onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospitable/Airbnb ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hospitable_id}
                  onChange={(e) => setFormData({ ...formData, hospitable_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="HB123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={formData.confirmation_code}
                  onChange={(e) => setFormData({ ...formData, confirmation_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.checkin_date}
                  onChange={(e) => setFormData({ ...formData, checkin_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.checkout_date}
                  onChange={(e) => setFormData({ ...formData, checkout_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Creating this booking will:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Generate access codes for all locks (Floor Door & Apartment Door)</li>
              <li>Create temporary passwords on Tuya smart locks</li>
              <li>Send WhatsApp/SMS notification to guest with access codes</li>
              <li>Generate a guest portal link for check-in information</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose }: {
  booking: BookingDetails
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{booking.booking.guest_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{booking.booking.guest_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{booking.booking.guest_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColors[booking.booking.status]}`}>
                  {booking.booking.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-medium">{format(new Date(booking.booking.checkin_date), 'PPP p')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-medium">{format(new Date(booking.booking.checkout_date), 'PPP p')}</p>
              </div>
            </div>
          </div>

          {/* Access Codes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Access Codes</h3>
            <div className="space-y-2">
              {booking.access_codes.map((code, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{code.lock_name}</p>
                    <p className="text-sm text-gray-600">
                      Valid: {format(new Date(code.valid_from), 'MMM dd, HH:mm')} - {format(new Date(code.valid_until), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-blue-600">{code.code}</p>
                    <p className={`text-xs ${code.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {code.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          {booking.activity_logs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {booking.activity_logs.map((log, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.event_type}</span>
                      <span className="text-gray-500">{format(new Date(log.created_at), 'MMM dd, HH:mm')}</span>
                    </div>
                    {log.description && (
                      <p className="text-gray-600 mt-1">{log.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
