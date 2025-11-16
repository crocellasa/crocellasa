'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, verifyToken } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Allow login page without auth
      if (pathname === '/admin/login') {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Check if user has token
      if (!isAuthenticated()) {
        router.push('/admin/login')
        return
      }

      // Verify token with backend
      const valid = await verifyToken()
      if (!valid) {
        router.push('/admin/login')
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthorized) {
    return null
  }

  // Render children when authorized
  return <>{children}</>
}
