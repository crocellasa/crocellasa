/**
 * Guest welcome header component
 */
import { format } from 'date-fns'
import { it, enUS } from 'date-fns/locale'

interface GuestHeaderProps {
  guestName: string
  checkinDate: string
  checkoutDate: string
  numGuests: number
  locale: 'it' | 'en'
}

export default function GuestHeader({
  guestName,
  checkinDate,
  checkoutDate,
  numGuests,
  locale
}: GuestHeaderProps) {
  const dateLocale = locale === 'it' ? it : enUS

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp', { locale: dateLocale })
  }

  const firstName = guestName.split(' ')[0]

  return (
    <div className="text-center py-8">
      <h1 className="text-5xl md:text-6xl font-light tracking-tight text-mono-900 mb-4">
        {locale === 'it' ? 'Benvenuto' : 'Welcome'}, <span className="font-normal">{firstName}</span>
      </h1>
      <p className="text-lg text-mono-500 font-light tracking-wide uppercase mb-12">
        Alcova Landolina
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <span className="text-mono-400 text-xs uppercase tracking-widest mb-2">
            {locale === 'it' ? 'Check-in' : 'Check-in'}
          </span>
          <span className="font-medium text-mono-900 text-sm">
            {formatDate(checkinDate)}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <span className="text-mono-400 text-xs uppercase tracking-widest mb-2">
            {locale === 'it' ? 'Check-out' : 'Check-out'}
          </span>
          <span className="font-medium text-mono-900 text-sm">
            {formatDate(checkoutDate)}
          </span>
        </div>

        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <span className="text-mono-400 text-xs uppercase tracking-widest mb-2">
            {locale === 'it' ? 'Ospiti' : 'Guests'}
          </span>
          <span className="font-medium text-mono-900 text-sm">
            {numGuests}
          </span>
        </div>
      </div>
    </div>
  )
}
