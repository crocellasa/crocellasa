'use client'

import { useEffect, useState } from 'react'
import { Calendar, Key, Bell, Activity as ActivityIcon, TrendingUp, Home } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-brass animate-pulse"></div>
            <p className="text-[10px] font-bold text-brand-brass-dark uppercase tracking-[0.3em]">Live Overview</p>
          </div>
          <h1 className="text-4xl font-serif text-brand-midnight tracking-tight">Main Dashboard</h1>
          <p className="text-brand-midnight/40 mt-2 font-light">
            Welcome back! Monitor your check-ins and property health in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-brass/10 rounded-xl text-xs font-medium text-brand-midnight hover:bg-brand-sand/50 transition-colors shadow-sm"
          >
            <TrendingUp className="w-3 h-3 text-brand-brass" />
            Recalculate Stats
          </button>
        </div>
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
          title="Status Monitor"
          value={stats.webhooksReceived}
          icon={Bell}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Main Analytics + Integration Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Analytics */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white shadow-elevated rounded-[2rem] p-8 border border-brand-brass/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif text-brand-midnight">Booking Analytics</h2>
                <p className="text-sm text-brand-midnight/40 font-light mt-1">7-day performance metrics</p>
              </div>
              <div className="px-4 py-2 bg-brand-sand/30 rounded-full">
                <p className="text-[10px] font-bold text-brand-brass-dark uppercase tracking-widest">Lodgify Sync: Active</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <AnalyticsChart />
            </div>
          </div>

          <RecentActivity />
        </div>

        {/* Right Column: Status & Integrations */}
        <div className="space-y-8">
          <IntegrationStatus />

          {/* Quick Help / Info Card */}
          <div className="bg-brand-midnight rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
              <Home className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-serif text-brand-brass mb-3 relative z-10">Professional Plan</h3>
            <p className="text-sm text-white/60 font-light leading-relaxed mb-6 relative z-10">
              You're currently managing 3 locks at Via Landolina #186. Your next scheduled Lodgify sync is in 4 hours.
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all relative z-10">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
