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
    <div className="card">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-alcova-navy mb-2">
          {locale === 'it' ? 'Benvenuto' : 'Welcome'}, {firstName}!
        </h1>
        <p className="text-alcova-charcoal/70 mb-6">
          Alcova Landolina
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-alcova-charcoal/60 text-xs uppercase tracking-wide mb-1">
              {locale === 'it' ? 'Check-in' : 'Check-in'}
            </span>
            <span className="font-semibold text-alcova-navy">
              {formatDate(checkinDate)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-alcova-charcoal/60 text-xs uppercase tracking-wide mb-1">
              {locale === 'it' ? 'Check-out' : 'Check-out'}
            </span>
            <span className="font-semibold text-alcova-navy">
              {formatDate(checkoutDate)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-alcova-charcoal/60 text-xs uppercase tracking-wide mb-1">
              {locale === 'it' ? 'Ospiti' : 'Guests'}
            </span>
            <span className="font-semibold text-alcova-navy">
              {numGuests}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
