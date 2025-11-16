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
    <div className="card">
      <h2 className="text-2xl font-serif text-alcova-navy mb-4 flex items-center gap-2">
        <Info className="w-6 h-6" />
        {locale === 'it' ? 'Regole della Casa' : 'House Rules'}
      </h2>

      <ul className="space-y-3">
        {rulesList.map((rule, index) => (
          <li key={index} className="flex items-start gap-2 text-alcova-charcoal">
            <span className="text-alcova-gold mt-1">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
