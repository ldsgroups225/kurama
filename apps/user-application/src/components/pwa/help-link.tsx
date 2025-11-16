import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Help link component that opens the offline help page
 * Available in a new window/tab for easy reference while using the app
 */
export function HelpLink() {
  const handleOpenHelp = () => {
    window.open('/help.html', 'kurama-help', 'width=1000,height=800')
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenHelp}
            className="h-9 w-9"
            aria-label="Ouvrir l'aide"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Aide (disponible hors ligne)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
