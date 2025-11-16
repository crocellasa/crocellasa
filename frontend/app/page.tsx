/**
 * Root page - redirects to guest portal if token provided
 */
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-alcova-navy mb-4">
          Alcova Landolina
        </h1>
        <p className="text-alcova-charcoal">
          Your home away from home in Florence
        </p>
      </div>
    </div>
  )
}
