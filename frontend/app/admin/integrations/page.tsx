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
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />
      case 'error':
      case 'disconnected':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      connected: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      disconnected: 'bg-gray-100 text-gray-700',
    }
    return classes[status as keyof typeof classes] || classes.disconnected
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your smart lock integrations and connected devices
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-blue-900">Setup Progress</p>
          <p className="text-sm font-semibold text-blue-900">3/3 Complete</p>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Integrations List */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{integration.statusMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(integration.status)}`}>
                      {integration.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
                      <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Token Info (Ring only) */}
                {integration.type === 'ring' && integration.token && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">API Token</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-xs font-mono text-gray-700 truncate">
                        {integration.token}
                      </code>
                      <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Refresh Token
                      </button>
                    </div>
                    {integration.tokenExpiry && (
                      <p className="text-xs text-gray-600 mt-2">
                        Expires: {new Date(integration.tokenExpiry).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Home Assistant Config */}
                {integration.type === 'home_assistant' && integration.config && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-900">Configuration</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">URL</p>
                        <p className="font-mono text-gray-900">{integration.config.url}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Entities</p>
                        <p className="font-semibold text-gray-900">{integration.config.entities}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Devices List */}
              {integration.devices && integration.devices.length > 0 && (
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DoorClosed className="w-4 h-4" />
                    Connected Devices ({integration.devices.length})
                  </h4>
                  <div className="grid gap-3">
                    {integration.devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            device.online ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <DoorClosed className={`w-5 h-5 ${
                              device.online ? 'text-green-700' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{device.name}</p>
                            <p className="text-xs text-gray-600">{device.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {device.battery !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Battery className={`w-4 h-4 ${
                                device.battery > 50 ? 'text-green-600' : device.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                              <span className="text-gray-700">{device.battery}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Wifi className={`w-4 h-4 ${device.online ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className={device.online ? 'text-green-700' : 'text-gray-500'}>
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
