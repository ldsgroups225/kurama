import { Check } from '@/lib/icons'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  label: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function ProgressIndicator({
  steps,
  currentStep,
}: ProgressIndicatorProps) {
  return (
    <div className="mx-auto mb-8 w-full max-w-lg">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    `
                      flex h-10 w-10 items-center justify-center rounded-full
                      border transition-all duration-300 shadow-lg
                    `,
                    isCompleted
                    && 'border-indigo-500 bg-indigo-500 text-white shadow-indigo-500/25',
                    isCurrent
                    && `
                      scale-110 border-indigo-500 bg-background shadow-indigo-500/20
                      text-indigo-400 ring-4 ring-indigo-500/20
                    `,
                    isUpcoming
                    && `
                      border-border bg-muted/50 text-muted-foreground
                    `,
                  )}
                >
                  {isCompleted
                    ? (
                      <Check className="h-5 w-5" />
                    )
                    : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-8 whitespace-nowrap text-xs font-semibold transition-colors',
                    isCurrent && 'text-indigo-400',
                    isCompleted && 'text-muted-foreground',
                    isUpcoming && 'text-muted-foreground/50',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative mx-2 h-[2px] w-full flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'absolute inset-0 h-full w-full bg-indigo-500 transition-transform duration-500 origin-left',
                      isCompleted ? 'scale-x-100' : 'scale-x-0',
                    )}
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
