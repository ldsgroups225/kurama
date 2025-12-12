import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Paperclip,
  Plus,
  Play,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Image,
  Upload,
  X,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  getAttachmentUploadUrl,
  getLessonAttachments,
  createAttachment,
  deleteAttachment,
  generateAttachmentEmbeddings,
} from '@/core/functions/storage'
import { toast } from 'sonner'

const typeIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  image: Image,
}

const typeLabels = {
  pdf: 'PDF',
  excel: 'Excel',
  image: 'Image',
}

function getFileTypeFromMime(contentType: string): 'pdf' | 'excel' | 'image' {
  if (contentType === 'application/pdf' || contentType === 'pdf') return 'pdf'
  if (
    contentType.includes('spreadsheet') ||
    contentType.includes('excel') ||
    contentType === 'excel'
  )
    return 'excel'
  return 'image'
}

interface AttachmentsSheetProps {
  lessonId: number
}

export function AttachmentsSheet({ lessonId }: AttachmentsSheetProps) {
  const queryClient = useQueryClient()
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileTitle, setFileTitle] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['lesson-attachments', lessonId],
    queryFn: () => getLessonAttachments({ data: lessonId }),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAttachment({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-attachments', lessonId] })
      toast.success('Fichier supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })

  // Embeddings mutation
  const embeddingsMutation = useMutation({
    mutationFn: (id: number) => generateAttachmentEmbeddings({ data: id }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-attachments', lessonId] })
      toast.success(`Embeddings générés: ${result.chunksProcessed} chunks traités`)
      setProcessingId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la génération des embeddings')
      setProcessingId(null)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setFileTitle(file.name.replace(/\.[^/.]+$/, ''))
    setUploadProgress(0)

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleCancelSelection = () => {
    setSelectedFile(null)
    setFileTitle('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Get presigned URL
      const { presignedUrl, publicUrl } = await getAttachmentUploadUrl({
        data: {
          lessonId,
          filename: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        },
      })

      // Upload with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(percent)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))

        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', selectedFile.type)
        xhr.send(selectedFile)
      })

      // Create attachment record in database
      await createAttachment({
        data: {
          lessonId,
          fileUrl: publicUrl,
          fileName: selectedFile.name,
          fileTitle: fileTitle || selectedFile.name,
          fileType: getFileTypeFromMime(selectedFile.type),
          fileSize: selectedFile.size,
        },
      })

      // Refresh list
      queryClient.invalidateQueries({ queryKey: ['lesson-attachments', lessonId] })

      toast.success('Fichier uploadé avec succès')
      handleCancelSelection()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateEmbeddings = (id: number) => {
    setProcessingId(id)
    embeddingsMutation.mutate(id)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="mr-2 h-4 w-4" />
          Pièces jointes
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md border-border/50 bg-background/80 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle>Pièces jointes</SheetTitle>
          <SheetDescription>
            Documents associés à cette leçon pour la génération IA.
          </SheetDescription>
        </SheetHeader>

        <motion.div
          className="flex flex-col gap-4 py-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xls,.xlsx,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload section */}
          {selectedFile ? (
            <motion.div variants={item} className="space-y-3 p-4 border rounded-lg bg-muted/30 border-border/50">
              {/* Preview */}
              <div className="flex items-start gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded border bg-muted">
                    {(() => {
                      const Icon = typeIcons[getFileTypeFromMime(selectedFile.type)]
                      return <Icon className="h-8 w-8 text-muted-foreground" />
                    })()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {typeLabels[getFileTypeFromMime(selectedFile.type)]} •{' '}
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelSelection}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* File title input */}
              <div className="space-y-2">
                <Label htmlFor="file-title">Titre du fichier</Label>
                <Input
                  id="file-title"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="Ex: Programme officiel Histoire 3ème"
                  disabled={isUploading}
                />
              </div>

              {/* Progress */}
              {isUploading && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                </div>
              )}

              {/* Upload button */}
              <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Commencer l'upload
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <Button
              className="w-full backdrop-blur-sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un fichier
            </Button>
          )}

          {/* Attachments list */}
          <div className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : attachments.length > 0 ? (
              attachments.map((attachment) => {
                const fileType = getFileTypeFromMime(attachment.fileType || 'pdf')
                const Icon = typeIcons[fileType]
                const isProcessing = processingId === attachment.id

                return (
                  <motion.div
                    key={attachment.id}
                    variants={item}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/50 transition-colors backdrop-blur-sm"
                  >
                    <div className="shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.fileTitle || attachment.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{typeLabels[fileType]}</span>
                        <span>•</span>
                        <span>
                          {new Date(attachment.updatedAt || attachment.createdAt).toLocaleDateString(
                            'fr-FR'
                          )}
                        </span>
                        <span>•</span>
                        <span
                          className={cn(
                            'inline-flex items-center',
                            attachment.hasEmbeddings ? 'text-green-600' : 'text-amber-600'
                          )}
                        >
                          {attachment.hasEmbeddings ? 'Embeddings ✓' : 'Non traité'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleGenerateEmbeddings(attachment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : attachment.hasEmbeddings ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Aucune pièce jointe</p>
              </div>
            )}
          </div>

        </motion.div>
      </SheetContent >
    </Sheet >
  )
}
