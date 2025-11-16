/**
 * Admin authentication utilities
 */

const ADMIN_TOKEN_KEY = 'alcova_admin_token';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'alcova2024';

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    // Simple token - in production use real JWT
    const token = btoa(`admin:${Date.now()}`);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function requireAdminAuth(): boolean {
  const isAuth = isAdminAuthenticated();
  if (!isAuth && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
  return isAuth;
}
