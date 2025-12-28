'use client'

import { Clock, Save } from 'lucide-react'

export default function CheckInTimesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal text-brand-midnight tracking-tight">Check-In Times</h1>
        <p className="text-sm text-brand-midnight/60 mt-1 font-normal">
          Configure default check-in and check-out times for your properties
        </p>
      </div>

      {/* Settings Form */}
      <div className="glass-card p-6">
        <div className="max-w-2xl space-y-6">
          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-brand-midnight mb-2">
              Default Check-In Time
            </label>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-midnight/50" />
              <input
                type="time"
                defaultValue="15:00"
                className="px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight"
              />
              <span className="text-sm text-brand-midnight/70 font-normal">3:00 PM</span>
            </div>
            <p className="text-xs text-brand-midnight/50 mt-2 font-normal">
              Access codes will be valid from this time on check-in day
            </p>
          </div>

          {/* Check-out Time */}
          <div>
            <label className="block text-sm font-medium text-brand-midnight mb-2">
              Default Check-Out Time
            </label>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-midnight/50" />
              <input
                type="time"
                defaultValue="11:00"
                className="px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight"
              />
              <span className="text-sm text-brand-midnight/70 font-normal">11:00 AM</span>
            </div>
            <p className="text-xs text-brand-midnight/50 mt-2 font-normal">
              Access codes will be revoked after this time on check-out day
            </p>
          </div>

          {/* Buffer Times */}
          <div className="border-t border-glass-border pt-6">
            <h3 className="text-sm font-semibold text-brand-midnight mb-4">Buffer Times</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Early Check-In Buffer (hours before)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  min="0"
                  max="24"
                  className="w-32 px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight"
                />
                <p className="text-xs text-brand-midnight/50 mt-1 font-normal">
                  Codes will be active 2 hours before check-in time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  Late Check-Out Buffer (hours after)
                </label>
                <input
                  type="number"
                  defaultValue="1"
                  min="0"
                  max="24"
                  className="w-32 px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight"
                />
                <p className="text-xs text-brand-midnight/50 mt-1 font-normal">
                  Codes will remain active 1 hour after check-out time
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-glass-border">
            <button className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
