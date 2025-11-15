import { Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface SessionHeaderProps {
  currentIndex: number
  totalCards: number
  progress: number
  onClose: () => void
  onSettings: () => void
}

export function SessionHeader({
  currentIndex,
  totalCards,
  progress,
  onClose,
  onSettings,
}: SessionHeaderProps) {
  return (
    <div className={`
      sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm
      supports-backdrop-filter:bg-background/60
    `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {currentIndex + 1}
            {' '}
            /
            {totalCards}
          </span>
        </div>

        <Button variant="ghost" size="icon" onClick={onSettings}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  )
}
