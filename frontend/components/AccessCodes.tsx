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
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="p-3 bg-brand-midnight rounded-2xl text-brand-ivory shadow-lg">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-serif text-brand-midnight">
          {locale === 'it' ? "Codici d'Accesso" : 'Access Codes'}
        </h2>
      </div>

      <div className="grid gap-6">
        {codes.map((code, index) => (
          <div
            key={index}
            className="glass-card group relative overflow-hidden ring-1 ring-brand-brass/5"
          >
            {/* Brass Tip Accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brass-gradient" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-serif text-brand-midnight mb-2">
                  {getLockName(code)}
                </h3>
                <div className="text-sm text-brand-brass/60 font-medium tracking-wide flex items-center gap-2">
                  <span className="opacity-50 uppercase text-[10px] tracking-widest">
                    {locale === 'it' ? 'Attivo' : 'Active'}
                  </span>
                  <span>
                    {format(new Date(code.valid_from), 'p', { locale: dateLocale })}
                  </span>
                  <span className="opacity-30">/</span>
                  <span>
                    {format(new Date(code.valid_until), 'p', { locale: dateLocale })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-5xl font-serif tracking-[0.2em] text-brand-brass bg-brand-ivory/80 px-8 py-4 rounded-2xl border border-brand-brass/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {code.code}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 flex gap-4 items-start border-l-4 border-l-brand-brass">
        <div className="text-brand-brass text-lg mt-0.5">✨</div>
        <div className="text-sm text-brand-midnight/70 leading-relaxed italic">
          {locale === 'it'
            ? 'Inserisci il codice sulla tastiera della serratura e premi #. La porta si aprirà automaticamente.'
            : 'Enter the code on the lock keypad and press #. The door will open automatically.'}
        </div>
      </div>
    </div>
  )
}
