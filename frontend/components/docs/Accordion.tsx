'use client'

import { ReactNode, useState } from 'react'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-200 rounded-lg my-6 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 px-6 py-4 transition-colors"
      >
        <span className="font-semibold text-slate-900 text-left">{title}</span>
        <svg
          className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-white border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  )
}
