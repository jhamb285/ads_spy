import Link from 'next/link'

interface PageNavigationProps {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
}

export function PageNavigation({ prev, next }: PageNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t border-slate-200">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <svg className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <div>
            <div className="text-xs text-slate-500">Previous</div>
            <div className="font-medium">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group text-right"
        >
          <div>
            <div className="text-xs text-slate-500">Next</div>
            <div className="font-medium">{next.title}</div>
          </div>
          <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
