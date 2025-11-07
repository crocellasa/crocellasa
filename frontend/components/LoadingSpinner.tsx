/**
 * Loading spinner component
 */
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-alcova-gold animate-spin mx-auto mb-4" />
        <p className="text-alcova-charcoal">Loading...</p>
      </div>
    </div>
  )
}
