/**
 * House rules component
 */
import { Info } from 'lucide-react'

interface HouseRulesProps {
  rules?: string
  locale: 'it' | 'en'
}

const defaultRules = {
  it: [
    '🔇 Silenzio dopo le 22:00',
    '🚭 Vietato fumare all\'interno',
    '🐾 Non sono ammessi animali',
    '⏰ Check-out entro le 11:00',
    '♻️ Segui le regole della raccolta differenziata',
  ],
  en: [
    '🔇 Quiet hours after 10 PM',
    '🚭 No smoking inside',
    '🐾 No pets allowed',
    '⏰ Check-out by 11:00 AM',
    '♻️ Follow recycling guidelines',
  ],
}

export default function HouseRules({ rules, locale }: HouseRulesProps) {
  const rulesList = rules ? rules.split('\n').filter(r => r.trim()) : defaultRules[locale]

  return (
    <div className="glass-card p-8 md:p-10 ring-1 ring-brand-brass/5">
      <h2 className="text-3xl font-serif text-brand-midnight mb-8 flex items-center gap-4">
        <div className="p-3 bg-brand-ivory rounded-2xl text-brand-brass shadow-sm border border-brand-brass/10">
          <Info className="w-6 h-6" />
        </div>
        {locale === 'it' ? 'Regole della Casa' : 'House Rules'}
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rulesList.map((rule, index) => (
          <li key={index} className="flex items-start gap-4 text-brand-midnight/70 font-medium group text-sm md:text-base italic">
            <span className="w-2 h-2 rounded-full bg-brand-brass/30 mt-2 flex-shrink-0 group-hover:bg-brand-brass transition-colors"></span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 pt-8 border-t border-brand-brass/10">
        <p className="text-[10px] text-center text-brand-brass/40 tracking-[0.2em] uppercase">
          {locale === 'it' ? 'Ti auguriamo un piacevole soggiorno' : 'We wish you a pleasant stay'}
        </p>
      </div>
    </div>
  )
}
