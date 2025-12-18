import type { BulkGenerateTeachPlansInput } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2, Sparkles, Zap } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { bulkGenerateTeachPlans } from '@/core/functions/ai-generation'
import { getLessons } from '@/core/functions/lessons'
import { getSubjectsSimple } from '@/core/functions/subjects'

const formSchema = z.object({
  country: z.string().min(1, 'Le pays est requis'),
  language: z.enum(['French', 'English']),
  schoolYear: z.string().min(1, 'L\'année scolaire est requise'),
  customInstructions: z.string().optional(),
  subjectId: z.number().optional(),
  gradeId: z.number().optional(),
})

type FormData = z.infer<typeof formSchema>

interface BulkGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkGenerateDialog({ open, onOpenChange, onSuccess }: BulkGenerateDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: 'Côte d\'Ivoire',
      language: 'French',
      schoolYear: '2025-2026',
      customInstructions: '',
    },
  })

  // Watch form values for reactive updates
  const watchedSubjectId = form.watch('subjectId')

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-simple'],
    queryFn: () => getSubjectsSimple(),
    enabled: open,
  })

  // Get count of lessons without teach plans (use limit 1 since we only need the total count)
  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['lessons-without-plans', watchedSubjectId],
    queryFn: async () => {
      const result = await getLessons({
        data: {
          page: 1,
          limit: 1, // Only need 1 record to get the total count
          hasTeachPlan: false,
          subjectId: watchedSubjectId,
        },
      })
      return result
    },
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (data: BulkGenerateTeachPlansInput) => bulkGenerateTeachPlans({ data }),
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
    const input: BulkGenerateTeachPlansInput = {
      country: data.country,
      language: data.language,
      schoolYear: data.schoolYear,
      customInstructions: data.customInstructions || undefined,
      subjectId: data.subjectId || undefined,
      gradeId: data.gradeId || undefined,
    }
    mutation.mutate(input)
  }

  // Use total from response (more reliable than array length for pagination)
  const lessonsCount = lessonsData?.total ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Génération en lot des plans IA
          </DialogTitle>
          <DialogDescription>
            Générer automatiquement les plans d'enseignement pour toutes les leçons qui n'en ont pas encore.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Côte d'Ivoire" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="French">Français</SelectItem>
                        <SelectItem value="English">Anglais</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schoolYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année scolaire</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2025-2026" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau (optionnel)</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(value === 'all' ? undefined : Number(value))}
                      value={field.value?.toString() || 'all'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les niveaux" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Tous les niveaux</SelectItem>
                        {/* Add grades here if needed */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions personnalisées (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Instructions spéciales pour la génération..."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions supplémentaires pour personnaliser la génération des plans.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Leçons à traiter</span>
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
                    ? 'Aucune leçon sans plan d\'enseignement trouvée'
                    : `${lessonsCount} leçon${lessonsCount > 1 ? 's' : ''} sans plan d'enseignement`}
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
                        <Zap className="h-4 w-4" />
                        Générer
                        {' '}
                        {lessonsCount}
                        {' '}
                        plan
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
