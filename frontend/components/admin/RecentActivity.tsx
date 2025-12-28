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
  door_open: 'text-green-600 bg-green-50 border-green-100',
  booking_created: 'text-blue-600 bg-blue-50 border-blue-100',
  code_created: 'text-purple-600 bg-purple-50 border-purple-100',
  code_revoked: 'text-red-600 bg-red-50 border-red-100',
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
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-elevated rounded-[2rem] p-8 border border-brand-brass/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif text-brand-midnight">Recent Activity</h2>
          <p className="text-sm text-brand-midnight/60 font-medium mt-1">Real-time property event stream</p>
        </div>
        <div className="p-2.5 bg-brand-sand/30 rounded-full">
          <Clock className="w-5 h-5 text-brand-brass" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 bg-brand-sand/20 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-brand-sand/20 rounded w-1/3"></div>
                <div className="h-3 bg-brand-sand/20 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-brand-sand/10 rounded-3xl border border-dashed border-brand-brass/20">
          <Clock className="w-12 h-12 mx-auto mb-4 text-brand-brass/20" />
          <p className="font-serif text-brand-midnight/40 text-lg">No recent activity detected</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]

            return (
              <div key={activity.id} className="flex items-start gap-5 group">
                <div className={`p-3 rounded-2xl border ${colorClass} transition-all duration-500 group-hover:scale-110 shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-brand-midnight truncate uppercase tracking-tight">
                      {activity.guestName}
                    </p>
                    <p className="text-[10px] text-brand-midnight/50 font-bold whitespace-nowrap uppercase tracking-widest">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-brand-midnight/70 font-normal leading-relaxed">
                    {activity.details} at <span className="font-bold text-brand-brass-dark">{activity.location}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="w-full mt-10 btn-secondary py-3 text-xs uppercase tracking-[0.2em] font-bold">
        Discover Complete History
      </button>
    </div>
  )
}
