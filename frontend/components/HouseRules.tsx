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
    <div className="glass-card p-6">
      <h2 className="text-xl font-light text-mono-900 mb-6 flex items-center gap-3 tracking-tight">
        <div className="p-2 bg-glass-highlight rounded-lg border border-glass-border">
          <Info className="w-5 h-5" />
        </div>
        {locale === 'it' ? 'Regole della Casa' : 'House Rules'}
      </h2>

      <ul className="space-y-4">
        {rulesList.map((rule, index) => (
          <li key={index} className="flex items-start gap-3 text-mono-600 font-light group">
            <span className="w-1.5 h-1.5 rounded-full bg-mono-300 mt-2 group-hover:bg-mono-900 transition-colors"></span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
