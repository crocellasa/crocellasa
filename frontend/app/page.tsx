import Link from 'next/link'

/**
 * Root page - redirects to admin dashboard or guest portal
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-serif text-brand-midnight mb-6 tracking-tight">
          Alcova Landolina
        </h1>
        <p className="text-xl text-brand-midnight/60 mb-12 font-normal tracking-wide italic">
          Smart Check-In Management System
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 bg-brand-midnight text-brand-ivory rounded-xl hover:shadow-lg transition-all font-medium tracking-wide flex items-center justify-center gap-2 group"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/g/demo"
            className="w-full sm:w-auto px-8 py-4 bg-brand-sand border border-brand-midnight/10 text-brand-midnight rounded-xl hover:bg-brand-sand-dark transition-all font-medium tracking-wide flex items-center justify-center"
          >
            Guest Portal Demo
          </Link>
        </div>
      </div>
    </div>
  )
}
