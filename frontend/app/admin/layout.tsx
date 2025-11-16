import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AuthGuard from '@/components/admin/AuthGuard'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
