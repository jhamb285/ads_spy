interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  variant?: 'horizontal' | 'vertical'
}

export function ProgressIndicator({ steps, currentStep, variant = 'horizontal' }: ProgressIndicatorProps) {
  if (variant === 'vertical') {
    return (
      <div className="my-8 space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="flex items-start gap-4">
              {/* Step Number */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white shadow-lg'
                    : isCurrent
                    ? 'bg-blue-500 text-white shadow-lg scale-110'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1.5">
                <p
                  className={`font-semibold transition-colors ${
                    isCurrent ? 'text-blue-700 text-lg' : isCompleted ? 'text-green-700' : 'text-slate-500'
                  }`}
                >
                  {step}
                </p>
                {isCurrent && <p className="text-sm text-blue-600 mt-1">In Progress...</p>}
                {isCompleted && <p className="text-sm text-green-600 mt-1">Completed</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal variant
  return (
    <div className="my-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-lg'
                      : isCurrent
                      ? 'bg-blue-500 text-white shadow-lg scale-125 ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`mt-3 text-sm font-medium text-center max-w-[120px] transition-colors ${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-slate-500'
                  }`}
                >
                  {step}
                </p>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-4 relative top-[-20px]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
