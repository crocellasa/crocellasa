'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, XCircle, Plug } from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'ring' | 'tuya' | 'home_assistant'
  status: 'connected' | 'warning' | 'error'
  message: string
  lastSync?: string
}

const statusIcons = {
  connected: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
}

const statusColors = {
  connected: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
}

const statusBadges = {
  connected: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
}

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrationStatus()
  }, [])

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/integrations/status`)
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      } else {
        // Mock data for development
        setIntegrations([
          {
            id: '1',
            name: 'Ring Intercom',
            type: 'ring',
            status: 'warning',
            message: 'Token expires in 3 days',
            lastSync: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Tuya Smart Locks',
            type: 'tuya',
            status: 'connected',
            message: '2 devices connected',
            lastSync: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Home Assistant',
            type: 'home_assistant',
            status: 'connected',
            message: 'All services operational',
            lastSync: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-mono-900">Integrations</h2>
          <p className="text-sm text-mono-500 font-light">Smart locks & connected services</p>
        </div>
        <Plug className="w-4 h-4 text-mono-400" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border border-glass-border rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-glass-highlight rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-glass-highlight rounded w-1/2"></div>
                <div className="h-3 bg-glass-highlight rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-8 text-mono-400">
          <Plug className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-light">No integrations configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => {
            const StatusIcon = statusIcons[integration.status]
            const iconColorClass = statusColors[integration.status]
            const badgeClass = statusBadges[integration.status]

            return (
              <div
                key={integration.id}
                className="flex items-center gap-4 p-4 border border-glass-border rounded-xl hover:bg-glass-surface/50 transition-colors group"
              >
                <div className={`p-2 rounded-full ${iconColorClass} bg-opacity-50`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-mono-900">
                      {integration.name}
                    </p>
                    <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full ${badgeClass} bg-opacity-50 border border-current/10`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-sm text-mono-500 font-light">
                    {integration.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="w-full mt-6 text-sm text-mono-600 hover:text-mono-900 font-medium transition-colors border-t border-glass-border pt-4">
        Manage integrations →
      </button>
    </div>
  )
}
