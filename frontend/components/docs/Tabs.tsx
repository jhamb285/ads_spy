'use client'

import { ReactNode, useState } from 'react'

interface TabProps {
  label: string
  children: ReactNode
}

interface TabsProps {
  children: ReactNode
  defaultTab?: number
}

export function Tab({ children }: TabProps) {
  return <div>{children}</div>
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const tabs = Array.isArray(children) ? children : [children]
  const validTabs = tabs.filter((tab: any) => tab && tab.props && tab.props.label)

  if (validTabs.length === 0) return null

  return (
    <div className="my-8">
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {validTabs.map((tab: any, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 font-medium text-sm transition-all ${
                activeTab === index
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.props.label}
            </button>
          ))}
        </div>
      </div>
      <div>{validTabs[activeTab]}</div>
    </div>
  )
}
