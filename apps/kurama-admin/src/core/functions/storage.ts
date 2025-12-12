import process from 'node:process'

import { eq, desc } from '@kurama/data-ops/database/drizzle-orm'
import { lessonsContentFile, lessonsContentChunks } from '@kurama/data-ops/drizzle/schema'
import {
  generatePresignedUploadUrl,
  initR2,
  isR2Configured,
  isValidFileSize,
} from '@kurama/data-ops/storage'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { adminMiddleware } from '@/core/middleware/admin-auth'
import { getDb, initAdminDb } from '@/lib/db'

// Valid file types for lesson attachments
const VALID_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

function isValidAttachmentType(contentType: string): boolean {
  return VALID_CONTENT_TYPES.includes(contentType)
}

// Auto-initialize R2 from environment variables if available
function ensureR2Initialized() {
  if (isR2Configured()) return true

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_LESSON_BUCKET_NAME || process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    initR2({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    })
    return true
  }

  return false
}

const GetAttachmentUploadUrlSchema = z.object({
  lessonId: z.number(),
  filename: z.string().min(1, 'Le nom du fichier est requis'),
  contentType: z.string().min(1, 'Le type de contenu est requis'),
  fileSize: z.number().positive('La taille du fichier doit être positive'),
})

type GetAttachmentUploadUrlInput = z.infer<typeof GetAttachmentUploadUrlSchema>

export const getAttachmentUploadUrl = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: GetAttachmentUploadUrlInput) => GetAttachmentUploadUrlSchema.parse(data))
  .handler(async ({ data }) => {
    const { lessonId, filename, contentType, fileSize } = data

    // Try to initialize R2 from environment variables
    ensureR2Initialized()

    // Check if R2 is configured
    if (!isR2Configured()) {
      throw new Error('Le stockage R2 n\'est pas configuré.')
    }

    // Validate file type
    if (!isValidAttachmentType(contentType)) {
      throw new Error('Type de fichier non supporté. Utilisez PDF, Excel ou images.')
    }

    // Validate file size (max 50MB)
    if (!isValidFileSize(fileSize, 50)) {
      throw new Error('Le fichier est trop volumineux. Taille maximale: 50MB.')
    }

    const result = await generatePresignedUploadUrl({
      filename,
      contentType,
      folder: `lessons/${lessonId}/attachments`,
      expiresIn: 3600,
    })

    return {
      presignedUrl: result.presignedUrl,
      publicUrl: result.publicUrl,
      key: result.key,
    }
  })

export const checkStorageConfigured = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async () => {
    ensureR2Initialized()
    return { configured: isR2Configured() }
  })

// Get attachments for a lesson
export const getLessonAttachments = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((lessonId: number) => lessonId)
  .handler(async ({ data: lessonId }) => {
    initAdminDb()
    const db = getDb()

    const attachments = await db
      .select({
        id: lessonsContentFile.id,
        fileUrl: lessonsContentFile.fileUrl,
        fileName: lessonsContentFile.fileName,
        fileTitle: lessonsContentFile.fileTitle,
        fileType: lessonsContentFile.fileType,
        fileSize: lessonsContentFile.fileSize,
        hasEmbeddings: lessonsContentFile.hasEmbeddings,
        createdAt: lessonsContentFile.createdAt,
        updatedAt: lessonsContentFile.updatedAt,
      })
      .from(lessonsContentFile)
      .where(eq(lessonsContentFile.lessonId, lessonId))
      .orderBy(desc(lessonsContentFile.createdAt))

    return attachments
  })

// Create attachment record after upload
const CreateAttachmentSchema = z.object({
  lessonId: z.number(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileTitle: z.string().optional(),
  fileType: z.string(),
  fileSize: z.number(),
})

type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>

export const createAttachment = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: CreateAttachmentInput) => CreateAttachmentSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    const [attachment] = await db
      .insert(lessonsContentFile)
      .values({
        lessonId: data.lessonId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileTitle: data.fileTitle || data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        hasEmbeddings: false,
      })
      .returning({ id: lessonsContentFile.id })

    return { id: attachment?.id, success: true }
  })

// Delete attachment
export const deleteAttachment = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    await db.delete(lessonsContentFile).where(eq(lessonsContentFile.id, id))

    return { success: true }
  })

// Generate embeddings for an attachment
export const generateAttachmentEmbeddings = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    initAdminDb()
    const db = getDb()

    // Get the attachment
    const [attachment] = await db
      .select()
      .from(lessonsContentFile)
      .where(eq(lessonsContentFile.id, id))

    if (!attachment) {
      throw new Error('Pièce jointe non trouvée')
    }

    // Only process PDFs for now
    if (attachment.fileType !== 'pdf') {
      throw new Error('Seuls les fichiers PDF peuvent être traités pour les embeddings')
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error('Clé API Gemini non configurée')
    }

    // Import embeddings utilities
    const { generateEmbedding, chunkText, extractTextFromPdf } = await import('@/lib/ai/embeddings')

    // Fetch the PDF from R2
    const response = await fetch(attachment.fileUrl)
    if (!response.ok) {
      throw new Error('Impossible de télécharger le fichier')
    }

    const pdfBuffer = await response.arrayBuffer()

    // Extract text from PDF using Gemini's native PDF understanding
    const { text } = await extractTextFromPdf(geminiApiKey, pdfBuffer)

    if (!text.trim()) {
      throw new Error('Aucun texte extrait du PDF')
    }

    // Chunk the text
    const chunks = chunkText(text)

    // Delete existing chunks for this file (for refresh/re-processing)
    await db
      .delete(lessonsContentChunks)
      .where(eq(lessonsContentChunks.fileId, id))

    // Process each chunk and insert into chunks table
    let processedChunks = 0

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      if (!chunk) continue

      // Generate embedding
      const embedding = await generateEmbedding(geminiApiKey, chunk)

      // Insert chunk with embedding into the chunks table
      await db.insert(lessonsContentChunks).values({
        fileId: id,
        chunkText: chunk,
        chunkIndex: i,
        embedding: embedding,
        metadata: { totalChunks: chunks.length } as Record<string, unknown>,
      })

      processedChunks++
    }

    // Update the parent file record with embedding status
    await db
      .update(lessonsContentFile)
      .set({
        hasEmbeddings: true,
        totalChunks: processedChunks,
        extractedText: text,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessonsContentFile.id, id))

    return {
      success: true,
      chunksProcessed: processedChunks,
    }
  })
