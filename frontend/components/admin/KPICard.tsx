import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number
  total?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend?: number
  loading?: boolean
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
}

export default function KPICard({
  title,
  value,
  total,
  icon: Icon,
  color,
  trend,
  loading,
}: KPICardProps) {
  return (
    <div className="bg-white shadow-elevated rounded-3xl p-6 border border-brand-brass/5 transition-all duration-500 hover:shadow-brass/10 hover:border-brand-brass/20 group">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl border ${colorClasses[color]} transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold text-brand-midnight/40 uppercase tracking-[0.2em] mb-2">{title}</p>
        {loading ? (
          <div className="h-10 w-24 bg-brand-sand/30 animate-pulse rounded-xl"></div>
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-serif text-brand-midnight">{value}</p>
            {total !== undefined && (
              <p className="text-sm text-brand-midnight/20 font-normal italic">/ {total}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
