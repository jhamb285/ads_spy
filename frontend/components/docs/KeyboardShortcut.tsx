'use client'

import { useEffect, useState } from 'react'

interface KeyboardShortcutProps {
  keys: string[]
  description: string
}

export function KeyboardShortcut({ keys, description }: KeyboardShortcutProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Convert Cmd to Ctrl on non-Mac
  const displayKeys = keys.map((key) => {
    if (key === 'Cmd' && !isMac) return 'Ctrl'
    if (key === 'Option' && !isMac) return 'Alt'
    return key
  })

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <span className="text-sm text-slate-700">{description}</span>
      <div className="flex items-center gap-1">
        {displayKeys.map((key, index) => (
          <span key={index} className="flex items-center">
            <kbd className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded shadow-sm min-w-[2.5rem] text-center">
              {key}
            </kbd>
            {index < displayKeys.length - 1 && (
              <span className="mx-1 text-slate-400">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

interface ShortcutListProps {
  shortcuts: Array<{ keys: string[]; description: string }>
  title?: string
}

export function ShortcutList({ shortcuts, title }: ShortcutListProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <KeyboardShortcut key={index} keys={shortcut.keys} description={shortcut.description} />
        ))}
      </div>
    </div>
  )
}
