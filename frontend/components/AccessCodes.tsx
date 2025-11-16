/**
 * Access codes display component
 */
import { Key } from 'lucide-react'
import { format } from 'date-fns'
import { it, enUS } from 'date-fns/locale'

interface AccessCode {
  lock_type: string
  code: string
  valid_from: string
  valid_until: string
  display_name_it?: string
  display_name_en?: string
}

interface AccessCodesProps {
  codes: AccessCode[]
  locale: 'it' | 'en'
}

export default function AccessCodes({ codes, locale }: AccessCodesProps) {
  const dateLocale = locale === 'it' ? it : enUS

  const getLockIcon = (lockType: string) => {
    return <Key className="w-6 h-6 text-alcova-gold" />
  }

  const getLockName = (code: AccessCode) => {
    if (locale === 'it' && code.display_name_it) {
      return code.display_name_it
    }
    if (locale === 'en' && code.display_name_en) {
      return code.display_name_en
    }

    // Fallback
    const names: Record<string, { it: string; en: string }> = {
      main_entrance: { it: 'Portone Principale', en: 'Main Entrance' },
      floor_door: { it: 'Porta Piano', en: 'Floor Door' },
      apartment_door: { it: 'Porta Appartamento', en: 'Apartment Door' },
    }

    return names[code.lock_type]?.[locale] || code.lock_type
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-serif text-alcova-navy mb-6 flex items-center gap-2">
        <Key className="w-6 h-6" />
        {locale === 'it' ? 'Codici d\'Accesso' : 'Access Codes'}
      </h2>

      <div className="space-y-4">
        {codes.map((code, index) => (
          <div
            key={index}
            className="border border-alcova-brass/20 rounded-lg p-4 hover:border-alcova-gold transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getLockIcon(code.lock_type)}
                <span className="font-semibold text-alcova-navy">
                  {getLockName(code)}
                </span>
              </div>
            </div>

            <div className="code-display mb-3">
              {code.code}
            </div>

            <div className="text-xs text-alcova-charcoal/60">
              <div>
                {locale === 'it' ? 'Valido dalle' : 'Valid from'}:{' '}
                {format(new Date(code.valid_from), 'PPp', { locale: dateLocale })}
              </div>
              <div>
                {locale === 'it' ? 'Valido fino alle' : 'Valid until'}:{' '}
                {format(new Date(code.valid_until), 'PPp', { locale: dateLocale })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-alcova-gold/10 rounded-lg text-sm text-alcova-charcoal">
        <p className="font-semibold mb-1">
          {locale === 'it' ? '💡 Come usare i codici:' : '💡 How to use the codes:'}
        </p>
        <p>
          {locale === 'it'
            ? 'Inserisci il codice sulla tastiera della serratura e premi #. La porta si aprirà automaticamente.'
            : 'Enter the code on the lock keypad and press #. The door will open automatically.'}
        </p>
      </div>
    </div>
  )
}
