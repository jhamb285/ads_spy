import { ReactNode } from 'react'

interface Step {
  number: number
  title: string
  children: ReactNode
}

export function Steps({ children }: { children: ReactNode }) {
  return <div className="space-y-6 my-8">{children}</div>
}

export function Step({ number, title, children }: Step) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform">
          {number}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-lg font-semibold text-slate-900 mb-2">{title}</h4>
        <div className="text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
