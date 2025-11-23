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
    <div className="w-64 glass-panel border-r border-glass-border flex flex-col h-full relative z-30">
      {/* Logo */}
      <div className="p-6 border-b border-glass-border">
        <h1 className="text-2xl font-light tracking-tight text-mono-900">Landolina</h1>
        <p className="text-xs text-mono-500 mt-1 uppercase tracking-wider">Admin Dashboard</p>
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
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-all duration-200
                  ${isActive
                    ? 'bg-glass-highlight text-mono-900 shadow-sm border border-glass-border'
                    : 'text-mono-600 hover:bg-glass-surface hover:text-mono-900'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-mono-900' : 'text-mono-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Setup Section */}
        <div>
          <h3 className="px-3 text-xs font-medium text-mono-400 uppercase tracking-wider mb-2">
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-all duration-200
                    ${isActive
                      ? 'bg-glass-highlight text-mono-900 shadow-sm border border-glass-border'
                      : 'text-mono-600 hover:bg-glass-surface hover:text-mono-900'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-mono-900' : 'text-mono-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h3 className="px-3 text-xs font-medium text-mono-400 uppercase tracking-wider mb-2">
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-all duration-200
                    ${isActive
                      ? 'bg-glass-highlight text-mono-900 shadow-sm border border-glass-border'
                      : 'text-mono-600 hover:bg-glass-surface hover:text-mono-900'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-mono-900' : 'text-mono-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-glass-border bg-glass-surface/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-mono-900 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-medium">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-mono-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-mono-500 truncate">{user?.email || 'admin@landolina.it'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-mono-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}
