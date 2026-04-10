'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/lib/docs-config'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(
    docsNav
      .filter(section =>
        section.children?.some(child => pathname === child.path)
      )
      .map(section => section.title)
  )

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  return (
    <nav className="space-y-1">
      {docsNav.map((section) => {
        const isExpanded = expandedSections.includes(section.title)
        const hasChildren = section.children && section.children.length > 0
        const isActive = pathname === section.path || section.children?.some(child => pathname === child.path)

        return (
          <div key={section.path}>
            {hasChildren ? (
              <button
                onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </div>
                <svg
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <Link
                href={section.path}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                  pathname === section.path
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </Link>
            )}

            {hasChildren && isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {section.children?.map((child) => (
                  <Link
                    key={child.path}
                    href={child.path}
                    className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                      pathname === child.path
                        ? 'bg-slate-100 text-slate-900 font-medium border-l-2 border-slate-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
