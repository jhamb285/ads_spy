import { ReactNode } from 'react'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  description?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    label: 'text-slate-600',
    value: 'text-slate-900',
  },
  primary: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    label: 'text-blue-600',
    value: 'text-blue-900',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    label: 'text-green-600',
    value: 'text-green-900',
  },
  warning: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    label: 'text-yellow-600',
    value: 'text-yellow-900',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-100',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    label: 'text-red-600',
    value: 'text-red-900',
  },
}

const trendStyles = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-slate-600',
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  trendDirection = 'neutral',
  description,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${styles.iconBg} rounded-lg p-3 text-3xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trendStyles[trendDirection]}`}>
            {trendDirection === 'up' && '↗'}
            {trendDirection === 'down' && '↘'}
            {trendDirection === 'neutral' && '→'}
            {' '}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className={`text-sm font-medium ${styles.label} uppercase tracking-wide`}>{label}</p>
        <p className={`text-3xl font-bold ${styles.value}`}>{value}</p>
        {description && <p className="text-sm text-slate-600 mt-2">{description}</p>}
      </div>
    </div>
  )
}

interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function StatGrid({ children, columns = 3 }: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return <div className={`grid ${gridCols[columns]} gap-6 my-8`}>{children}</div>
}
