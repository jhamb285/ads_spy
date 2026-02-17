interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'
}

const colorStyles = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-slate-100 text-slate-800 border-slate-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200'
}

export function Badge({ children, color = 'blue' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorStyles[color]}`}>
      {children}
    </span>
  )
}
