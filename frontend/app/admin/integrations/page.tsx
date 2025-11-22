'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Key,
  Battery,
  Wifi,
  Home,
  DoorClosed
} from 'lucide-react'

interface IntegrationDetail {
  id: string
  name: string
  type: 'ring' | 'tuya' | 'home_assistant'
  status: 'connected' | 'warning' | 'error' | 'disconnected'
  statusMessage: string
  token?: string
  tokenExpiry?: string
  devices?: {
    id: string
    name: string
    battery?: number
    online: boolean
    location: string
  }[]
  lastSync?: string
  config?: Record<string, any>
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/integrations`)
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      } else {
        // Mock data
        setIntegrations([
          {
            id: '1',
            name: 'Ring Intercom API',
            type: 'ring',
            status: 'warning',
            statusMessage: 'Token expires in 3 days',
            token: 'eyJydCI6ImV5...truncated',
            tokenExpiry: '2025-12-18T00:00:00Z',
            devices: [
              {
                id: 'ring_device_1',
                name: 'Downstairs Intercom',
                battery: 83,
                online: true,
                location: 'Via Landolina #186',
              },
            ],
            lastSync: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Tuya Smart Locks',
            type: 'tuya',
            status: 'connected',
            statusMessage: 'All devices operational',
            devices: [
              {
                id: 'tuya_main',
                name: 'Main Entrance',
                battery: 95,
                online: true,
                location: 'Via Landolina #186',
              },
              {
                id: 'tuya_apt',
                name: 'Apartment Door',
                battery: 88,
                online: true,
                location: 'Via Landolina #186',
              },
            ],
            lastSync: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Home Assistant',
            type: 'home_assistant',
            status: 'connected',
            statusMessage: 'All services operational',
            config: {
              url: 'http://homeassistant.local:8123',
              entities: 5,
            },
            lastSync: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'error':
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-mono-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      connected: 'bg-green-50 text-green-700 border-green-100',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      error: 'bg-red-50 text-red-700 border-red-100',
      disconnected: 'bg-mono-50 text-mono-700 border-mono-100',
    }
    return classes[status as keyof typeof classes] || classes.disconnected
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-mono-900 tracking-tight">Integrations</h1>
        <p className="text-sm text-mono-500 mt-1 font-light">
          Manage your smart lock integrations and connected devices
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="glass-card p-4 bg-glass-highlight/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-mono-900">Setup Progress</p>
          <p className="text-sm font-medium text-mono-900">3/3 Complete</p>
        </div>
        <div className="w-full bg-glass-surface rounded-full h-1.5">
          <div className="bg-mono-900 h-1.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Integrations List */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-glass-highlight rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-glass-highlight rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="glass-card overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h3 className="text-lg font-medium text-mono-900">{integration.name}</h3>
                      <p className="text-sm text-mono-500 mt-1 font-light">{integration.statusMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${getStatusBadge(integration.status)}`}>
                      {integration.status}
                    </span>
                    <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors text-mono-400 hover:text-mono-900" title="Refresh">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Token Info (Ring only) */}
                {integration.type === 'ring' && integration.token && (
                  <div className="bg-glass-surface rounded-lg p-4 border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-mono-500" />
                      <p className="text-sm font-medium text-mono-900">API Token</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-white/50 px-3 py-2 rounded border border-glass-border text-xs font-mono text-mono-600 truncate">
                        {integration.token}
                      </code>
                      <button className="px-3 py-2 bg-mono-900 text-white text-sm rounded-lg hover:bg-mono-800 transition-colors font-light">
                        Refresh Token
                      </button>
                    </div>
                    {integration.tokenExpiry && (
                      <p className="text-xs text-mono-400 mt-2 font-light">
                        Expires: {new Date(integration.tokenExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Home Assistant Config */}
                {integration.type === 'home_assistant' && integration.config && (
                  <div className="bg-glass-surface rounded-lg p-4 border border-glass-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="w-4 h-4 text-mono-500" />
                      <p className="text-sm font-medium text-mono-900">Configuration</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-mono-500 font-light">URL</p>
                        <p className="font-mono text-mono-900 text-xs mt-1">{integration.config.url}</p>
                      </div>
                      <div>
                        <p className="text-mono-500 font-light">Entities</p>
                        <p className="font-medium text-mono-900 mt-1">{integration.config.entities}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Devices List */}
              {integration.devices && integration.devices.length > 0 && (
                <div className="p-6 bg-glass-surface/30">
                  <h4 className="text-xs font-medium text-mono-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DoorClosed className="w-3 h-3" />
                    Connected Devices ({integration.devices.length})
                  </h4>
                  <div className="grid gap-3">
                    {integration.devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-glass-surface rounded-xl border border-glass-border hover:border-glass-border/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${device.online ? 'bg-green-50' : 'bg-mono-100'
                            }`}>
                            <DoorClosed className={`w-4 h-4 ${device.online ? 'text-green-700' : 'text-mono-400'
                              }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-mono-900">{device.name}</p>
                            <p className="text-xs text-mono-500 font-light">{device.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {device.battery !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Battery className={`w-4 h-4 ${device.battery > 50 ? 'text-green-600' : device.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              <span className="text-mono-600 font-light">{device.battery}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Wifi className={`w-4 h-4 ${device.online ? 'text-green-600' : 'text-mono-300'}`} />
                            <span className={`font-light ${device.online ? 'text-green-700' : 'text-mono-400'}`}>
                              {device.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
