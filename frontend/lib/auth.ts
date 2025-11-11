/**
 * Admin authentication utilities
 */

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  admin: AdminUser
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

/**
 * Login admin user
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  const data: LoginResponse = await response.json()

  // Store token and user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.admin))
  }

  return data
}

/**
 * Logout admin user
 */
export async function logout(): Promise<void> {
  const token = getToken()

  if (token) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
  }

  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Get stored auth token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get stored admin user
 */
export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken()
}

/**
 * Verify token with backend
 */
export async function verifyToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // Token invalid/expired
      logout()
      return false
    }

    return true
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, {
    ...options,
    headers,
  })
}
