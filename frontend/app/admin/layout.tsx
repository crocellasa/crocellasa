import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AuthGuard from '@/components/admin/AuthGuard'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-subtle-gradient font-sans text-mono-900">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AdminHeader />

          <main className="flex-1 overflow-y-auto p-6 relative z-10">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
