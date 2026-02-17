interface PageHeaderProps {
  title: string
  description?: string
  icon?: string
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="mb-10 pb-8 border-b border-slate-200">
      <div className="flex items-center gap-4 mb-4">
        {icon && <span className="text-5xl">{icon}</span>}
        <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
      </div>
      {description && (
        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  )
}
