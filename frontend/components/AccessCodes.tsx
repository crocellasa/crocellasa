/**
 * Access codes display component
 */
import { Key, Copy } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="p-2 bg-mono-900 rounded-lg text-white">
          <Key className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-medium text-mono-900">
          {locale === 'it' ? 'Codici d\'Accesso' : 'Access Codes'}
        </h2>
      </div>

      <div className="grid gap-4">
        {codes.map((code, index) => (
          <div
            key={index}
            className="glass-card group relative overflow-hidden"
          >
            {/* Gradient Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-mono-900 to-mono-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-mono-600 mb-1">
                  {getLockName(code)}
                </h3>
                <div className="text-xs text-mono-400 flex gap-2">
                  <span>
                    {format(new Date(code.valid_from), 'HH:mm', { locale: dateLocale })}
                  </span>
                  <span>→</span>
                  <span>
                    {format(new Date(code.valid_until), 'HH:mm', { locale: dateLocale })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold tracking-widest text-mono-900 font-mono bg-white/50 px-4 py-2 rounded-lg border border-glass-border">
                  {code.code}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-4 flex gap-3 items-start">
        <div className="text-mono-900 mt-0.5">💡</div>
        <div className="text-sm text-mono-500 leading-relaxed">
          {locale === 'it'
            ? 'Inserisci il codice sulla tastiera della serratura e premi #. La porta si aprirà automaticamente.'
            : 'Enter the code on the lock keypad and press #. The door will open automatically.'}
        </div>
      </div>
    </div>
  )
}
