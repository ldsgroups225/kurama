import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type CardOrientation = 'term' | 'definition'

interface SessionSettingsDialogProps {
  open: boolean
  cardOrientation: CardOrientation
  onOpenChange: (open: boolean) => void
  onOrientationChange: (orientation: CardOrientation) => void
  onReset: () => void
}

export function SessionSettingsDialog({
  open,
  cardOrientation,
  onOpenChange,
  onOrientationChange,
  onReset,
}: SessionSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Orientation des cartes</h3>
            <div className="flex gap-2">
              <Button
                variant={cardOrientation === 'term' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => onOrientationChange('term')}
              >
                Terme
              </Button>
              <Button
                variant={cardOrientation === 'definition' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => onOrientationChange('definition')}
              >
                Définition
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Recto</p>
          </div>

          <div className="border-t pt-4">
            <Button variant="outline" className="w-full text-primary" onClick={onReset}>
              Parcourir à nouveau les cartes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
