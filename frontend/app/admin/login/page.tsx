'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Redirect to dashboard on success
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory relative overflow-hidden px-4">
      {/* Decorative Brand Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-brass-gradient"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-brass/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-midnight/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-6 bg-brand-brass/10 border border-brand-brass/20 rounded-full">
            <p className="text-[10px] font-bold text-brand-brass-dark uppercase tracking-[0.3em]">
              Alcova Landolina
            </p>
          </div>
          <h1 className="text-5xl font-serif text-brand-midnight mb-3 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-brand-midnight/40 font-light tracking-wide italic">
            Management console for professional hosting
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-elevated rounded-[2.5rem] p-10 border border-brand-brass/5 ring-1 ring-white/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-brand-midnight/60 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-brass">
                    <Mail className="h-5 w-5 text-brand-midnight/20" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-brand-ivory/30 border border-brand-brass/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-brass/20 focus:border-brand-brass/30 focus:bg-white text-brand-midnight placeholder-brand-midnight/20 transition-all duration-300 shadow-sm"
                    placeholder="admin@landolina.it"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-bold text-brand-midnight/60 uppercase tracking-widest ml-1">
                  Security Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-brass">
                    <Lock className="h-5 w-5 text-brand-midnight/20" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-brand-ivory/30 border border-brand-brass/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-brass/20 focus:border-brand-brass/30 focus:bg-white text-brand-midnight placeholder-brand-midnight/20 transition-all duration-300 shadow-sm"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-lg shadow-brass/20 hover:shadow-brass/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accessing Portal...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 bg-brand-sand/30 border border-brand-brass/10 rounded-2xl border-dashed">
            <p className="text-[10px] font-bold text-brand-midnight/40 mb-3 uppercase tracking-tighter">Authorized Demo Access Only</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-brand-midnight/30 uppercase font-medium mb-1">User</p>
                <code className="text-xs text-brand-midnight/70 block truncate">admin@landolina.it</code>
              </div>
              <div>
                <p className="text-[9px] text-brand-midnight/30 uppercase font-medium mb-1">Pass</p>
                <code className="text-xs text-brand-midnight/70">admin123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-brand-midnight/30 mt-10 uppercase tracking-[0.2em] font-medium">
          Alcova Landolina &copy; MMXXV
        </p>
      </div>
    </div>
  )
}
