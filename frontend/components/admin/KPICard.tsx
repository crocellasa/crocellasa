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
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
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
    <div className="glass-card p-6 transition-all duration-300 hover:shadow-lg hover:border-glass-border/80">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} bg-opacity-50 backdrop-blur-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'
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
        <p className="text-xs font-medium text-mono-500 uppercase tracking-wider mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-glass-highlight animate-pulse rounded"></div>
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-light text-mono-900">{value}</p>
            {total !== undefined && (
              <p className="text-sm text-mono-400 font-light">/ {total}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
