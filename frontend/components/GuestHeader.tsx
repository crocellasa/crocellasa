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
    <div className="text-center py-12 md:py-16">
      <h1 className="text-6xl md:text-8xl font-serif text-brand-midnight mb-4">
        {locale === 'it' ? 'Benvenuto' : 'Welcome'}, <span className="italic">{firstName}</span>
      </h1>
      <p className="text-xl text-brand-brass font-serif tracking-widest uppercase mb-16">
        Alcova Landolina
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          <span className="text-brand-brass/60 text-[10px] uppercase tracking-[0.2em] mb-3">
            {locale === 'it' ? 'Check-in' : 'Check-in'}
          </span>
          <span className="font-serif text-brand-midnight text-lg">
            {formatDate(checkinDate)}
          </span>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          <span className="text-brand-brass/60 text-[10px] uppercase tracking-[0.2em] mb-3">
            {locale === 'it' ? 'Check-out' : 'Check-out'}
          </span>
          <span className="font-serif text-brand-midnight text-lg">
            {formatDate(checkoutDate)}
          </span>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          <span className="text-brand-brass/60 text-[10px] uppercase tracking-[0.2em] mb-3">
            {locale === 'it' ? 'Ospiti' : 'Guests'}
          </span>
          <span className="font-serif text-brand-midnight text-lg">
            {numGuests} {numGuests === 1 ? (locale === 'it' ? 'Ospite' : 'Guest') : (locale === 'it' ? 'Ospiti' : 'Guests')}
          </span>
        </div>
      </div>
    </div>
  )
}
