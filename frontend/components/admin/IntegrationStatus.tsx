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
  connected: 'text-green-600 bg-green-50 border-green-100',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  error: 'text-red-600 bg-red-50 border-red-100',
}

const statusBadges = {
  connected: 'bg-green-500/10 text-green-600 border-green-200',
  warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  error: 'bg-red-500/10 text-red-600 border-red-200',
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
    <div className="bg-white shadow-elevated rounded-[2rem] p-8 border border-brand-brass/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif text-brand-midnight">Integrations</h2>
          <p className="text-sm text-brand-midnight/40 font-light mt-1">Smart ecosystem status</p>
        </div>
        <div className="p-2.5 bg-brand-sand/30 rounded-full">
          <Plug className="w-5 h-5 text-brand-brass" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-5 bg-brand-sand/10 border border-brand-brass/5 rounded-2xl animate-pulse">
              <div className="w-10 h-10 bg-brand-sand/20 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-brand-sand/20 rounded w-1/2"></div>
                <div className="h-3 bg-brand-sand/20 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12 bg-brand-sand/10 rounded-3xl border border-dashed border-brand-brass/20">
          <Plug className="w-12 h-12 mx-auto mb-4 text-brand-brass/20" />
          <p className="font-serif text-brand-midnight/40 text-lg">No active integrations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => {
            const StatusIcon = statusIcons[integration.status]
            const iconColorClass = statusColors[integration.status]
            const badgeClass = statusBadges[integration.status]

            return (
              <div
                key={integration.id}
                className="flex items-center gap-5 p-5 bg-brand-ivory/30 border border-brand-brass/5 rounded-2xl hover:bg-brand-sand/30 hover:border-brand-brass/20 transition-all duration-300 group shadow-sm"
              >
                <div className={`p-3 rounded-xl border ${iconColorClass} transition-transform duration-500 group-hover:rotate-6`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-brand-midnight uppercase tracking-tight">
                      {integration.name}
                    </p>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border ${badgeClass}`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-midnight/50 font-light italic">
                    {integration.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button className="w-full mt-10 btn-brass py-3 text-xs uppercase tracking-[0.2em] font-bold">
        Access Infrastructure Panel
      </button>
    </div>
  )
}
