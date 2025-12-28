'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Key,
  Link2,
  Settings,
  Home,
  Activity,
  Plug,
  Clock,
  LogOut
} from 'lucide-react'
import { logout, getUser } from '@/lib/auth'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Access Links', href: '/admin/access-links', icon: Link2 },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity },
]

const setupSection = [
  { name: 'Integrations', href: '/admin/integrations', icon: Plug },
  { name: 'Locations & Locks', href: '/admin/locations', icon: Home },
]

const settingsSection = [
  { name: 'Check-In Times', href: '/admin/check-in-times', icon: Clock },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const user = getUser()

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="w-64 bg-brand-midnight text-white flex flex-col h-full z-20 shadow-2xl">
      {/* Logo */}
      <div className="p-8 border-b border-white/5">
        <h1 className="text-2xl font-serif text-brand-brass tracking-tight">Landolina</h1>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-[0.2em] font-medium">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group
                  ${isActive
                    ? 'bg-brand-brass text-white shadow-brass'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-brand-brass/60 group-hover:text-brand-brass'}`} />
                <span className={isActive ? 'font-medium' : 'font-normal'}>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Setup Section */}
        <div>
          <h3 className="px-3 text-xs font-medium text-brand-midnight/50 uppercase tracking-wider mb-2">
            Setup
          </h3>
          <div className="space-y-1">
            {setupSection.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group
                    ${isActive
                      ? 'bg-brand-brass text-white shadow-brass'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-brand-brass/60 group-hover:text-brand-brass'}`} />
                  <span className={isActive ? 'font-medium' : 'font-normal'}>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h3 className="px-5 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">
            Settings
          </h3>
          <div className="space-y-1">
            {settingsSection.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group
                    ${isActive
                      ? 'bg-brand-brass text-white shadow-brass'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-brand-brass/60 group-hover:text-brand-brass'}`} />
                  <span className={isActive ? 'font-medium' : 'font-normal'}>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-4">
          <div className="w-10 h-10 bg-brand-brass rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white text-sm font-bold -rotate-3">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-white/40 truncate uppercase tracking-wider">{user?.role || 'Administrator'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/50 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300 disabled:opacity-50 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}
