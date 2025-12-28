'use client'

import { Link2, Plus, Copy, Trash2, ExternalLink } from 'lucide-react'

export default function AccessLinksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal text-brand-midnight tracking-tight">Access Links</h1>
          <p className="text-sm text-brand-midnight/60 mt-1 font-normal">
            Generate temporary access links for guests without bookings
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Access Link
        </button>
      </div>

      {/* Coming Soon */}
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-glass-highlight rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border">
          <Link2 className="w-8 h-8 text-brand-midnight" />
        </div>
        <h3 className="text-lg font-medium text-brand-midnight mb-2">Access Links Management</h3>
        <p className="text-brand-midnight/60 mb-6 max-w-md mx-auto font-normal">
          Generate one-time or temporary access links for maintenance, cleaners, or emergency access.
          Links can be time-limited and single-use.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-glass-surface border border-glass-border text-brand-midnight/70 rounded-lg text-sm font-medium">
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  )
}
