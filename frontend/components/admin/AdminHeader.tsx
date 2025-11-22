'use client'

import { Bell, RefreshCw } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="bg-glass-surface/50 backdrop-blur-md border-b border-glass-border px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            className="p-2 text-mono-500 hover:text-mono-900 hover:bg-glass-highlight rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="p-2 text-mono-500 hover:text-mono-900 hover:bg-glass-highlight rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Environment Badge */}
          <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 text-xs font-medium rounded-full shadow-sm">
            Production
          </span>
        </div>
      </div>
    </header>
  )
}
