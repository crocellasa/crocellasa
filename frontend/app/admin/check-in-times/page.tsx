'use client'

import { Clock, Save } from 'lucide-react'

export default function CheckInTimesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check-In Times</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure default check-in and check-out times for your properties
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-2xl space-y-6">
          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default Check-In Time
            </label>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <input
                type="time"
                defaultValue="15:00"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">3:00 PM</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Access codes will be valid from this time on check-in day
            </p>
          </div>

          {/* Check-out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default Check-Out Time
            </label>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <input
                type="time"
                defaultValue="11:00"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">11:00 AM</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Access codes will be revoked after this time on check-out day
            </p>
          </div>

          {/* Buffer Times */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Buffer Times</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Early Check-In Buffer (hours before)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  min="0"
                  max="24"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Codes will be active 2 hours before check-in time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Check-Out Buffer (hours after)
                </label>
                <input
                  type="number"
                  defaultValue="1"
                  min="0"
                  max="24"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Codes will remain active 1 hour after check-out time
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
