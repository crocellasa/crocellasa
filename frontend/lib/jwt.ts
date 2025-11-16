/**
 * JWT token validation utilities
 */
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface TokenPayload {
  booking_id: string
  type: string
  checkout_date: string
  exp: number
  iat: number
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return payload as unknown as TokenPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
