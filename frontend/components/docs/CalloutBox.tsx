import { ReactNode } from 'react'

type CalloutType = 'info' | 'success' | 'warning' | 'danger'

interface CalloutBoxProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const styles = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    iconBg: 'bg-blue-100',
    title: 'text-blue-900',
    text: 'text-blue-800'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    iconBg: 'bg-green-100',
    title: 'text-green-900',
    text: 'text-green-800'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚠️',
    iconBg: 'bg-yellow-100',
    title: 'text-yellow-900',
    text: 'text-yellow-800'
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
    iconBg: 'bg-red-100',
    title: 'text-red-900',
    text: 'text-red-800'
  }
}

export function CalloutBox({ type = 'info', title, children }: CalloutBoxProps) {
  const style = styles[type]

  return (
    <div className={`${style.bg} ${style.border} border-l-4 rounded-r-lg p-5 my-6 flex gap-4`}>
      <div className={`${style.iconBg} rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 text-lg`}>
        {style.icon}
      </div>
      <div className="flex-1">
        {title && <div className={`font-semibold ${style.title} mb-2`}>{title}</div>}
        <div className={style.text}>{children}</div>
      </div>
    </div>
  )
}

export function InfoBox({ title, children }: Omit<CalloutBoxProps, 'type'>) {
  return <CalloutBox type="info" title={title}>{children}</CalloutBox>
}

export function SuccessBox({ title, children }: Omit<CalloutBoxProps, 'type'>) {
  return <CalloutBox type="success" title={title}>{children}</CalloutBox>
}

export function WarningBox({ title, children }: Omit<CalloutBoxProps, 'type'>) {
  return <CalloutBox type="warning" title={title}>{children}</CalloutBox>
}

export function DangerBox({ title, children }: Omit<CalloutBoxProps, 'type'>) {
  return <CalloutBox type="danger" title={title}>{children}</CalloutBox>
}
