'use client'

import { useEffect, useState } from 'react'
import { DoorOpen, UserPlus, Key, XCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'door_open' | 'booking_created' | 'code_created' | 'code_revoked'
  guestName: string
  location: string
  timestamp: string
  details?: string
}

const activityIcons = {
  door_open: DoorOpen,
  booking_created: UserPlus,
  code_created: Key,
  code_revoked: XCircle,
}

const activityColors = {
  door_open: 'text-green-600 bg-green-50',
  booking_created: 'text-blue-600 bg-blue-50',
  code_created: 'text-purple-600 bg-purple-50',
  code_revoked: 'text-red-600 bg-red-50',
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity/recent?limit=10`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        // Mock data for development
        setActivities([
          {
            id: '1',
            type: 'door_open',
            guestName: 'Marco Rossi',
            location: 'Via Landolina #186',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            details: 'Main entrance opened',
          },
          {
            id: '2',
            type: 'booking_created',
            guestName: 'Sarah Johnson',
            location: 'Via Landolina #186',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            details: 'Check-in: Dec 15',
          },
          {
            id: '3',
            type: 'code_created',
            guestName: 'Giovanni Bianchi',
            location: 'Via Landolina #186',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            details: '3 access codes generated',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Latest events from your properties</p>
        </div>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]

            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2.5 rounded-full ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.guestName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.details} • {activity.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all activity →
      </button>
    </div>
  )
}
