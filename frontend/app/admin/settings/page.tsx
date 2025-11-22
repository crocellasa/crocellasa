'use client'

import { Settings, User, Bell, Key, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-mono-900 tracking-tight">Settings</h1>
        <p className="text-sm text-mono-500 mt-1 font-light">
          Manage your account and application settings
        </p>
      </div>

      {/* Account Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-mono-600" />
          <h2 className="text-lg font-medium text-mono-900">Account Settings</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Admin"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-mono-900 font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="admin@landolina.it"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-mono-900 font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="+39 123 456 7890"
              className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-mono-900 font-light"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-mono-600" />
          <h2 className="text-lg font-medium text-mono-900">Notification Settings</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-mono-900">Booking Notifications</p>
              <p className="text-xs text-mono-500 font-light">Get notified when new bookings are created</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-mono-900">Door Access Alerts</p>
              <p className="text-xs text-mono-500 font-light">Get notified when doors are accessed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-mono-900">System Errors</p>
              <p className="text-xs text-mono-500 font-light">Get notified about system errors and issues</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-mono-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mono-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mono-900"></div>
            </label>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-mono-600" />
          <h2 className="text-lg font-medium text-mono-900">API Settings</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Webhook URL (Hospitable)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${process.env.NEXT_PUBLIC_API_URL}/webhooks/hospitable`}
                className="flex-1 px-4 py-2 border border-glass-border rounded-lg bg-glass-surface text-mono-600 text-sm font-mono font-light"
              />
              <button className="px-4 py-2 bg-glass-surface hover:bg-glass-highlight border border-glass-border rounded-lg transition-colors text-sm font-medium text-mono-700">
                Copy
              </button>
            </div>
            <p className="text-xs text-mono-500 mt-2 font-light">
              Configure this URL in your Hospitable webhook settings
            </p>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-mono-600" />
          <h2 className="text-lg font-medium text-mono-900">Language & Region</h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Default Language
            </label>
            <select className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-mono-900 font-light">
              <option value="en">English</option>
              <option value="it" selected>Italiano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-mono-700 mb-2">
              Timezone
            </label>
            <select className="w-full px-4 py-2 bg-glass-surface border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mono-900/10 text-mono-900 font-light">
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
