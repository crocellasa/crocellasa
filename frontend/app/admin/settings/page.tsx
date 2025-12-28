'use client'

import { Settings, User, Bell, Key, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal text-brand-midnight tracking-tight">Settings</h1>
        <p className="text-sm text-brand-midnight/60 mt-1 font-normal">
          Manage your account and application settings
        </p>
      </div>

      {/* Account Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-brand-midnight/70" />
          <h2 className="text-lg font-medium text-brand-midnight">Account Settings</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Admin"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight font-normal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="admin@landolina.it"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight font-normal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="+39 123 456 7890"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight font-normal"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-brand-midnight/70" />
          <h2 className="text-lg font-medium text-brand-midnight">Notification Settings</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-midnight">Booking Notifications</p>
              <p className="text-xs text-brand-midnight/60 font-normal">Get notified when new bookings are created</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-midnight"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-midnight">Door Access Alerts</p>
              <p className="text-xs text-brand-midnight/60 font-normal">Get notified when doors are accessed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-midnight"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-midnight">System Errors</p>
              <p className="text-xs text-brand-midnight/60 font-normal">Get notified about system errors and issues</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-midnight"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API & Webhook Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-brand-midnight/70" />
          <h2 className="text-lg font-medium text-brand-midnight">Integration Settings</h2>
        </div>

        <div className="max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-bold text-brand-midnight mb-2 uppercase tracking-tight">
              Webhook URL (PMS / Lodgify)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${process.env.NEXT_PUBLIC_API_URL}/webhooks/lodgify`}
                className="flex-1 px-4 py-2 border border-glass-border rounded-lg bg-glass-surface text-brand-midnight/70 text-sm font-mono font-normal"
              />
              <button className="px-4 py-2 bg-brand-sand hover:bg-brand-sand-dark border border-glass-border rounded-lg transition-colors text-sm font-bold text-brand-midnight uppercase tracking-tighter">
                Copy
              </button>
            </div>
            <p className="text-xs text-brand-midnight/60 mt-2 font-normal italic">
              Configure this URL in your Lodgify webhook settings (v2) to receive real-time updates.
            </p>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-brand-midnight/70" />
          <h2 className="text-lg font-medium text-brand-midnight">Language & Region</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Default Language
            </label>
            <select className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight font-normal">
              <option value="en">English</option>
              <option value="it" selected>Italiano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Timezone
            </label>
            <select className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-brand-midnight font-normal">
              <option value="Europe/Rome" selected>Europe/Rome (GMT+1)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save All Settings
        </button>
      </div>
    </div>
  )
}
