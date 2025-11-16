'use client'

import { useEffect, useState } from 'react'
import { Calendar, Filter, DoorOpen, UserPlus, Key, XCircle, Bell, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface ActivityLog {
  id: string
  event_type: 'door_open' | 'booking_created' | 'booking_cancelled' | 'code_created' | 'code_revoked' | 'notification_sent' | 'error'
  user_name?: string
  guest_name?: string
  property_id: string
  location: string
  details: string
  metadata?: Record<string, any>
  timestamp: string
}

const eventIcons = {
  door_open: DoorOpen,
  booking_created: UserPlus,
  booking_cancelled: XCircle,
  code_created: Key,
  code_revoked: XCircle,
  notification_sent: Bell,
  error: AlertTriangle,
}

const eventColors = {
  door_open: 'bg-green-100 text-green-700 border-green-200',
  booking_created: 'bg-blue-100 text-blue-700 border-blue-200',
  booking_cancelled: 'bg-red-100 text-red-700 border-red-200',
  code_created: 'bg-purple-100 text-purple-700 border-purple-200',
  code_revoked: 'bg-orange-100 text-orange-700 border-orange-200',
  notification_sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  error: 'bg-red-100 text-red-700 border-red-200',
}

const eventLabels = {
  door_open: 'Door Opened',
  booking_created: 'Booking Created',
  booking_cancelled: 'Booking Cancelled',
  code_created: 'Code Created',
  code_revoked: 'Code Revoked',
  notification_sent: 'Notification Sent',
  error: 'Error',
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('7days')

  useEffect(() => {
    fetchActivity()
  }, [dateFilter])

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity?period=${dateFilter}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        // Mock data
        const now = new Date()
        setActivities([
          {
            id: '1',
            event_type: 'door_open',
            guest_name: 'Marco Rossi',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: 'Main entrance opened successfully',
            metadata: { lock_type: 'main_entrance', code_used: '1234' },
            timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
          },
          {
            id: '2',
            event_type: 'booking_created',
            guest_name: 'Sarah Johnson',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: 'New booking from Hospitable webhook',
            metadata: { confirmation_code: 'ABC123', nights: 3 },
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: '3',
            event_type: 'code_created',
            guest_name: 'Giovanni Bianchi',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: '3 access codes generated (Tuya + Ring)',
            metadata: { codes_count: 3 },
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: '4',
            event_type: 'notification_sent',
            guest_name: 'Sarah Johnson',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: 'WhatsApp message sent with portal link',
            metadata: { channel: 'whatsapp', status: 'delivered' },
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
          },
          {
            id: '5',
            event_type: 'door_open',
            guest_name: 'Giovanni Bianchi',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: 'Floor door opened via Ring intercom',
            metadata: { lock_type: 'floor_door', code_used: '5678' },
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
          },
          {
            id: '6',
            event_type: 'code_revoked',
            guest_name: 'Marco Rossi',
            property_id: 'alcova_landolina_fi',
            location: 'Via Landolina #186',
            details: 'All codes revoked after checkout',
            metadata: { reason: 'checkout_completed', codes_count: 3 },
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter((activity) =>
    filterType === 'all' || activity.event_type === filterType
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-600 mt-1">
          Complete timeline of all events and actions across your properties
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Event Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="door_open">Door Opens</option>
              <option value="booking_created">Bookings Created</option>
              <option value="code_created">Codes Created</option>
              <option value="notification_sent">Notifications</option>
              <option value="error">Errors</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex-1"></div>

          {/* Export Button */}
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            Export CSV
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading activity...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No activity found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {filteredActivities.map((activity, index) => {
              const Icon = eventIcons[activity.event_type]
              const colorClass = eventColors[activity.event_type]

              return (
                <div key={activity.id} className="relative">
                  {/* Timeline Line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 w-14 h-14 rounded-full border-2 flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${colorClass}`}>
                              {eventLabels[activity.event_type]}
                            </span>
                            {activity.guest_name && (
                              <span className="text-sm font-medium text-gray-900">
                                {activity.guest_name}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{activity.details}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{format(new Date(activity.timestamp), 'MMM dd, yyyy')}</p>
                          <p className="text-xs">{format(new Date(activity.timestamp), 'HH:mm:ss')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                        <span>•</span>
                        <span>{activity.location}</span>
                        {activity.metadata && (
                          <>
                            <span>•</span>
                            <span>{Object.keys(activity.metadata).length} metadata fields</span>
                          </>
                        )}
                      </div>

                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <details className="mt-3">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-3 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
