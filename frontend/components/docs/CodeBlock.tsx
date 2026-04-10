'use client'

import { useState } from 'react'

interface CodeBlockProps {
  children: string
  language?: string
  copyable?: boolean
}

export function CodeBlock({ children, language = 'bash', copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-6">
      <pre className="bg-slate-900 text-slate-100 p-5 rounded-lg overflow-x-auto border border-slate-700 shadow-lg">
        <code className="text-sm font-mono">{children}</code>
      </pre>
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-1.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}
