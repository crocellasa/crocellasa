'use client'

import { useEffect, useState } from 'react'
import { Calendar, Key, Bell, Activity as ActivityIcon, TrendingUp } from 'lucide-react'
import KPICard from '@/components/admin/KPICard'
import AnalyticsChart from '@/components/admin/AnalyticsChart'
import RecentActivity from '@/components/admin/RecentActivity'
import IntegrationStatus from '@/components/admin/IntegrationStatus'

interface DashboardStats {
  totalBookings: number
  activeBookings: number
  totalAccessCodes: number
  activeAccessCodes: number
  totalDoorOpens: number
  webhooksReceived: number
  bookingsTrend: number
  accessCodesTrend: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeBookings: 0,
    totalAccessCodes: 0,
    activeAccessCodes: 0,
    totalDoorOpens: 0,
    webhooksReceived: 0,
    bookingsTrend: 0,
    accessCodesTrend: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back! Here's what's happening with your properties.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Bookings"
          value={stats.activeBookings}
          total={stats.totalBookings}
          icon={Calendar}
          color="blue"
          trend={stats.bookingsTrend}
          loading={loading}
        />
        <KPICard
          title="Access Codes"
          value={stats.activeAccessCodes}
          total={stats.totalAccessCodes}
          icon={Key}
          color="green"
          trend={stats.accessCodesTrend}
          loading={loading}
        />
        <KPICard
          title="Door Opens"
          value={stats.totalDoorOpens}
          icon={ActivityIcon}
          color="purple"
          loading={loading}
        />
        <KPICard
          title="Webhooks"
          value={stats.webhooksReceived}
          icon={Bell}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
            <p className="text-sm text-gray-600">Last 7 days overview</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Bookings & Access Usage</span>
          </div>
        </div>
        <AnalyticsChart />
      </div>

      {/* Bottom Grid: Recent Activity + Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <IntegrationStatus />
      </div>
    </div>
  )
}
