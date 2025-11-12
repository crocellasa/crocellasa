/**
 * Admin Login Page
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin, isAdminAuthenticated } from '@/lib/admin/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = loginAdmin(password)
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Password non valida')
      }
    } catch (err) {
      setError('Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alcova-navy to-alcova-charcoal flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-alcova-navy mb-2">
            Alcova Admin
          </h1>
          <p className="text-alcova-charcoal">
            Accedi al portale amministrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-alcova-charcoal mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alcova-gold focus:border-transparent outline-none transition"
              placeholder="Inserisci la password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alcova-gold hover:bg-alcova-brass text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Default password: alcova2024</p>
          <p className="text-xs mt-1">(Cambiare in produzione)</p>
        </div>
      </div>
    </div>
  )
}
