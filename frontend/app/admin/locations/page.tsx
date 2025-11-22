'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, DoorClosed, Edit2, Trash2, Save, X } from 'lucide-react'

interface Lock {
  id: string
  device_id: string
  device_name: string
  lock_type: 'main_entrance' | 'floor_door' | 'apartment'
  property_id: string
  display_name_it: string
  display_name_en: string
  display_order: number
  is_active: boolean
  battery?: number
  online: boolean
}

interface Location {
  id: string
  name: string
  address: string
  locks: Lock[]
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLock, setEditingLock] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/locations`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      } else {
        // Mock data
        setLocations([
          {
            id: 'alcova_landolina_fi',
            name: 'Alcova Landolina',
            address: 'Via Landolina #186, Florence, Italy',
            locks: [
              {
                id: '1',
                device_id: 'tuya_main_12345',
                device_name: 'Main Entrance Lock',
                lock_type: 'main_entrance',
                property_id: 'alcova_landolina_fi',
                display_name_it: 'Ingresso principale',
                display_name_en: 'Main entrance',
                display_order: 1,
                is_active: true,
                battery: 95,
                online: true,
              },
              {
                id: '2',
                device_id: 'ring_intercom_67890',
                device_name: 'Floor Door Intercom',
                lock_type: 'floor_door',
                property_id: 'alcova_landolina_fi',
                display_name_it: 'Piano (citofono)',
                display_name_en: 'Floor door',
                display_order: 2,
                is_active: true,
                battery: 83,
                online: true,
              },
              {
                id: '3',
                device_id: 'tuya_apt_54321',
                device_name: 'Apartment Door Lock',
                lock_type: 'apartment',
                property_id: 'alcova_landolina_fi',
                display_name_it: 'Porta appartamento',
                display_name_en: 'Apartment door',
                display_order: 3,
                is_active: true,
                battery: 88,
                online: true,
              },
            ],
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const lockTypeLabels = {
    main_entrance: 'Main Entrance',
    floor_door: 'Floor Door',
    apartment: 'Apartment Door',
  }

  const lockTypeColors = {
    main_entrance: 'bg-blue-50 text-blue-700 border-blue-100',
    floor_door: 'bg-purple-50 text-purple-700 border-purple-100',
    apartment: 'bg-green-50 text-green-700 border-green-100',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-mono-900 tracking-tight">Locations & Locks</h1>
          <p className="text-sm text-mono-500 mt-1 font-light">
            Manage your properties and their smart lock configurations
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Locations List */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mono-900 mx-auto"></div>
          <p className="text-mono-500 mt-4 font-light">Loading locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="glass-card p-8 text-center text-mono-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-light">No locations configured</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {locations.map((location) => (
            <div key={location.id} className="glass-card overflow-hidden">
              {/* Location Header */}
              <div className="p-6 border-b border-glass-border bg-glass-surface/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-glass-highlight rounded-lg flex items-center justify-center border border-glass-border">
                      <MapPin className="w-6 h-6 text-mono-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-mono-900">{location.name}</h3>
                      <p className="text-sm text-mono-500 mt-1 font-light">{location.address}</p>
                      <p className="text-xs text-mono-400 mt-2 font-light">
                        Property ID: <code className="bg-glass-surface px-2 py-0.5 rounded border border-glass-border">{location.id}</code>
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-glass-surface rounded-lg transition-colors text-mono-400 hover:text-mono-900">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Locks Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-medium text-mono-500 uppercase tracking-wider flex items-center gap-2">
                    <DoorClosed className="w-3 h-3" />
                    Smart Locks ({location.locks.length})
                  </h4>
                  <button className="text-sm text-mono-600 hover:text-mono-900 font-medium flex items-center gap-1 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Lock
                  </button>
                </div>

                <div className="grid gap-3">
                  {location.locks.map((lock) => (
                    <div
                      key={lock.id}
                      className="flex items-center justify-between p-4 bg-glass-surface rounded-xl border border-glass-border hover:border-glass-border/80 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lock.online ? 'bg-green-50' : 'bg-mono-100'
                          }`}>
                          <DoorClosed className={`w-5 h-5 ${lock.online ? 'text-green-700' : 'text-mono-400'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-mono-900">{lock.device_name}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${lockTypeColors[lock.lock_type]}`}>
                              {lockTypeLabels[lock.lock_type]}
                            </span>
                            {!lock.is_active && (
                              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-mono-100 text-mono-500 border border-mono-200">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-mono-500 font-light">
                            <span>IT: {lock.display_name_it}</span>
                            <span>•</span>
                            <span>EN: {lock.display_name_en}</span>
                            <span>•</span>
                            <span>Order: {lock.display_order}</span>
                          </div>
                          <p className="text-xs text-mono-400 mt-1 font-light">
                            Device ID: <code>{lock.device_id}</code>
                          </p>
                        </div>
                      </div>

                      {/* Lock Stats */}
                      <div className="flex items-center gap-6 mr-4">
                        {lock.battery !== undefined && (
                          <div className="text-center">
                            <p className={`text-sm font-medium ${lock.battery > 50 ? 'text-green-600' : lock.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                              {lock.battery}%
                            </p>
                            <p className="text-[10px] text-mono-400 uppercase tracking-wider">Battery</p>
                          </div>
                        )}
                        <div className="text-center">
                          <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${lock.online ? 'bg-green-500' : 'bg-mono-300'
                            }`}></div>
                          <p className="text-[10px] text-mono-400 uppercase tracking-wider">{lock.online ? 'Online' : 'Offline'}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-glass-highlight rounded-lg transition-colors text-mono-400 hover:text-mono-900"
                          title="Edit lock"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-mono-400 hover:text-red-600"
                          title="Delete lock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
