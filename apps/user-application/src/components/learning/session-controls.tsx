import { Pause, Play, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionControlsProps {
  isAutoPlaying: boolean
  canGoBack: boolean
  onToggleAutoPlay: () => void
  onPrevCard: () => void
}

export function SessionControls({
  isAutoPlaying,
  canGoBack,
  onToggleAutoPlay,
  onPrevCard,
}: SessionControlsProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevCard}
          disabled={!canGoBack}
          className={`
            h-12 w-12 rounded-full
            disabled:opacity-30
          `}
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAutoPlay}
          className="h-12 w-12 rounded-full"
        >
          {isAutoPlaying
            ? <Pause className="h-5 w-5" />
            : (
                <Play className="h-5 w-5" />
              )}
        </Button>
      </div>
    </div>
  )
}
