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
    <div className="mx-auto mb-8 w-full">
      <div className="flex items-center justify-around">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    `
                      flex h-10 w-10 items-center justify-center rounded-full
                      border-2 transition-all duration-300
                    `,
                    isCompleted
                    && 'border-orange-500 bg-orange-500 text-white',
                    isCurrent
                    && `
                      scale-110 border-orange-500 bg-orange-50 text-orange-600
                      dark:bg-orange-950 dark:text-orange-400
                    `,
                    isUpcoming
                    && `
                      border-zinc-300 bg-background text-zinc-400
                      dark:border-zinc-700 dark:text-zinc-600
                    `,
                  )}
                >
                  {isCompleted
                    ? (
                        <Check className="h-5 w-5" />
                      )
                    : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    (isCompleted || isCurrent)
                    && 'text-foreground',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 transition-all duration-300',
                    isCompleted
                      ? 'bg-orange-500'
                      : `
                        bg-zinc-200
                        dark:bg-zinc-800
                      `,
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
