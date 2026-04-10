import Link from 'next/link'
import { ReactNode } from 'react'

interface QuickActionCardProps {
  icon: string
  title: string
  description: string
  action: {
    label: string
    href: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const variantStyles = {
  default: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-slate-300',
    iconBg: 'bg-white',
    button: 'bg-slate-900 hover:bg-slate-800 text-white',
  },
  primary: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    iconBg: 'bg-white',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  success: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
    border: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    iconBg: 'bg-white',
    button: 'bg-green-600 hover:bg-green-700 text-white',
  },
  warning: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100',
    border: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    iconBg: 'bg-white',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
}

export function QuickActionCard({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: QuickActionCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`${styles.bg} border ${styles.border} ${styles.hoverBorder} rounded-xl p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div
          className={`${styles.iconBg} rounded-xl p-4 w-fit mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-5xl">{icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>

        {/* Action Button */}
        <Link href={action.href} className="mt-6">
          <button
            className={`w-full ${styles.button} px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
          >
            {action.label}
            <svg
              className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  )
}

interface QuickActionGridProps {
  children: ReactNode
  columns?: 2 | 3
}

export function QuickActionGrid({ children, columns = 2 }: QuickActionGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return <div className={`grid ${gridCols[columns]} gap-6 my-8`}>{children}</div>
}
