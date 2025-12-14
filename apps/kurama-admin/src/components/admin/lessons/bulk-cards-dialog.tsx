import type { BulkGenerateCardsInput } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FileText, Loader2, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { bulkGenerateCards } from '@/core/functions/ai-generation'
import { getLessons } from '@/core/functions/lessons'
import { getSubjectsSimple } from '@/core/functions/subjects'

const formSchema = z.object({
  amount: z.number().int().min(5).max(30),
  subjectId: z.number().optional(),
  gradeId: z.number().optional(),
})

type FormData = z.infer<typeof formSchema>

interface BulkCardsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkCardsDialog({ open, onOpenChange, onSuccess }: BulkCardsDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 10,
    },
  })

  const watchedSubjectId = form.watch('subjectId')

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => getSubjectsSimple(),
    enabled: open,
  })

  // Get count of lessons with teach plans but no cards
  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['lessons-without-cards', watchedSubjectId],
    queryFn: async () => {
      const result = await getLessons({
        data: {
          page: 1,
          limit: 1,
          hasTeachPlan: true,
          hasCards: false,
          subjectId: watchedSubjectId,
        },
      })
      return result
    },
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (data: BulkGenerateCardsInput) => bulkGenerateCards({ data }),
    onSuccess: (result) => {
      toast.success(result.message)
      onSuccess()
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la génération en lot')
    },
  })

  const onSubmit = (data: FormData) => {
    const input: BulkGenerateCardsInput = {
      amount: data.amount,
      subjectId: data.subjectId || undefined,
      gradeId: data.gradeId || undefined,
    }
    mutation.mutate(input)
  }

  const lessonsCount = lessonsData?.total ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Génération en lot des cartes
          </DialogTitle>
          <DialogDescription>
            Générer automatiquement les cartes d'étude pour toutes les leçons qui ont un plan IA mais pas encore de cartes.
            Le nombre de cartes sera extrait des recommandations du plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartes par défaut</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={30}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Utilisé si non spécifié dans le plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière (optionnel)</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(value === 'all' ? undefined : Number(value))}
                    value={field.value?.toString() || 'all'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les matières" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {subjectsData?.map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Leçons éligibles</span>
                </div>
                {isLoadingLessons
                  ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )
                  : (
                    <Badge variant="secondary" className="font-mono">
                      {lessonsCount}
                    </Badge>
                  )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoadingLessons
                  ? 'Chargement des leçons...'
                  : lessonsCount === 0
                    ? 'Aucune leçon éligible (avec plan IA et sans cartes)'
                    : `${lessonsCount} leçon${lessonsCount > 1 ? 's' : ''} avec plan IA et sans cartes`}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong>
                {' '}
                Le nombre de cartes sera extrait automatiquement de la section
                "Cartes d'étude recommandées" de chaque plan. Si non trouvé, la valeur par défaut sera utilisée.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isLoadingLessons || lessonsCount === 0}
                className="gap-2"
              >
                {mutation.isPending
                  ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  )
                  : (
                    <>
                      <FileText className="h-4 w-4" />
                      Générer pour
                      {' '}
                      {lessonsCount}
                      {' '}
                      leçon
                      {lessonsCount > 1 ? 's' : ''}
                    </>
                  )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
