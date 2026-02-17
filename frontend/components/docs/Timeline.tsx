import { ReactNode } from 'react'

interface TimelineItemProps {
  icon: string
  time: string
  title: string
  description: string | ReactNode
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineProps {
  children: ReactNode
}

export function TimelineItem({ icon, time, title, description, status = 'completed' }: TimelineItemProps) {
  const statusStyles = {
    completed: {
      iconBg: 'bg-slate-100 border-slate-400',
      iconText: 'text-slate-700',
      line: 'bg-slate-300',
      time: 'text-slate-700',
    },
    current: {
      iconBg: 'bg-slate-200 border-slate-500',
      iconText: 'text-slate-900',
      line: 'bg-slate-400',
      time: 'text-slate-900',
    },
    upcoming: {
      iconBg: 'bg-slate-100 border-slate-300',
      iconText: 'text-slate-400',
      line: 'bg-slate-200',
      time: 'text-slate-500',
    },
  }

  const styles = statusStyles[status]

  return (
    <div className="relative pl-12 pb-10 last:pb-0 group">
      {/* Vertical Line */}
      <div
        className={`absolute left-5 top-10 w-0.5 h-full ${styles.line} transition-colors`}
      />

      {/* Icon */}
      <div
        className={`absolute left-0 top-0 ${styles.iconBg} border-2 ${styles.iconText} rounded-full p-2 text-2xl transition-all duration-300 group-hover:scale-110`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <span className={`text-sm font-semibold ${styles.time} px-3 py-1 bg-slate-50 rounded-full`}>
            {time}
          </span>
        </div>
        <div className="text-slate-600 leading-relaxed">{description}</div>
      </div>
    </div>
  )
}

export function Timeline({ children }: TimelineProps) {
  return <div className="my-8">{children}</div>
}
