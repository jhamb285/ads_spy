import { ReactNode } from 'react'

interface FeatureProps {
  icon: string
  title: string
  children: ReactNode
}

export function FeatureGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {children}
    </div>
  )
}

export function Feature({ icon, title, children }: FeatureProps) {
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-slate-900 mb-2">{title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  )
}
