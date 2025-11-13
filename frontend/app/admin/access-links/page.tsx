'use client'

import { Link2, Plus, Copy, Trash2, ExternalLink } from 'lucide-react'

export default function AccessLinksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Links</h1>
          <p className="text-sm text-gray-600 mt-1">
            Generate temporary access links for guests without bookings
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Access Link
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Links Management</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Generate one-time or temporary access links for maintenance, cleaners, or emergency access.
          Links can be time-limited and single-use.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
