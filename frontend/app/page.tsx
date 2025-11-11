import Link from 'next/link'

/**
 * Root page - redirects to admin dashboard or guest portal
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-alcova-navy mb-4">
          Alcova Landolina
        </h1>
        <p className="text-alcova-charcoal mb-8">
          Smart Check-In Management System
        </p>
        <div className="flex items-center gap-4 justify-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-alcova-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/g/demo"
            className="px-6 py-3 border-2 border-alcova-navy text-alcova-navy rounded-lg hover:bg-alcova-navy hover:text-white transition-colors font-medium"
          >
            Guest Portal Demo
          </Link>
        </div>
      </div>
    </div>
  )
}
