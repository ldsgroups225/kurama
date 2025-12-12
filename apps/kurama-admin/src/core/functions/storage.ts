import process from 'node:process'

import { eq, desc, and, sql } from '@kurama/data-ops/database/drizzle-orm'
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

// Input type for getLessonAttachments
const GetLessonAttachmentsSchema = z.object({
  lessonId: z.number(),
  subjectId: z.number().optional(),
  gradeId: z.number().optional(),
  seriesId: z.number().optional().nullable(),
})

type GetLessonAttachmentsInput = z.infer<typeof GetLessonAttachmentsSchema>

// Get attachments for a lesson (including subject-wide attachments)
export const getLessonAttachments = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: GetLessonAttachmentsInput) => GetLessonAttachmentsSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    // Get direct lesson attachments
    const directAttachments = await db
      .select({
        id: lessonsContentFile.id,
        fileUrl: lessonsContentFile.fileUrl,
        fileName: lessonsContentFile.fileName,
        fileTitle: lessonsContentFile.fileTitle,
        fileType: lessonsContentFile.fileType,
        fileSize: lessonsContentFile.fileSize,
        hasEmbeddings: lessonsContentFile.hasEmbeddings,
        isSubjectWide: lessonsContentFile.isSubjectWide,
        createdAt: lessonsContentFile.createdAt,
        updatedAt: lessonsContentFile.updatedAt,
      })
      .from(lessonsContentFile)
      .where(eq(lessonsContentFile.lessonId, data.lessonId))
      .orderBy(desc(lessonsContentFile.createdAt))

    // Get subject-wide attachments if subject info is provided
    let subjectWideAttachments: typeof directAttachments = []
    if (data.subjectId && data.gradeId) {
      const conditions = [
        eq(lessonsContentFile.isSubjectWide, true),
        eq(lessonsContentFile.subjectId, data.subjectId),
        eq(lessonsContentFile.gradeId, data.gradeId),
      ]

      // Match series if provided, or get attachments with no series (applies to all)
      if (data.seriesId) {
        subjectWideAttachments = await db
          .select({
            id: lessonsContentFile.id,
            fileUrl: lessonsContentFile.fileUrl,
            fileName: lessonsContentFile.fileName,
            fileTitle: lessonsContentFile.fileTitle,
            fileType: lessonsContentFile.fileType,
            fileSize: lessonsContentFile.fileSize,
            hasEmbeddings: lessonsContentFile.hasEmbeddings,
            isSubjectWide: lessonsContentFile.isSubjectWide,
            createdAt: lessonsContentFile.createdAt,
            updatedAt: lessonsContentFile.updatedAt,
          })
          .from(lessonsContentFile)
          .where(sql`${lessonsContentFile.isSubjectWide} = true 
            AND ${lessonsContentFile.subjectId} = ${data.subjectId} 
            AND ${lessonsContentFile.gradeId} = ${data.gradeId}
            AND (${lessonsContentFile.seriesId} = ${data.seriesId} OR ${lessonsContentFile.seriesId} IS NULL)`)
          .orderBy(desc(lessonsContentFile.createdAt))
      } else {
        subjectWideAttachments = await db
          .select({
            id: lessonsContentFile.id,
            fileUrl: lessonsContentFile.fileUrl,
            fileName: lessonsContentFile.fileName,
            fileTitle: lessonsContentFile.fileTitle,
            fileType: lessonsContentFile.fileType,
            fileSize: lessonsContentFile.fileSize,
            hasEmbeddings: lessonsContentFile.hasEmbeddings,
            isSubjectWide: lessonsContentFile.isSubjectWide,
            createdAt: lessonsContentFile.createdAt,
            updatedAt: lessonsContentFile.updatedAt,
          })
          .from(lessonsContentFile)
          .where(and(...conditions))
          .orderBy(desc(lessonsContentFile.createdAt))
      }
    }

    // Combine and return, subject-wide first
    return [...subjectWideAttachments, ...directAttachments]
  })

// Create attachment record after upload
const CreateAttachmentSchema = z.object({
  lessonId: z.number(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileTitle: z.string().optional(),
  fileType: z.string(),
  fileSize: z.number(),
  // Subject-wide attachment fields
  attachToAllSubjectLessons: z.boolean().default(false),
  subjectId: z.number().optional(),
  gradeId: z.number().optional(),
  seriesId: z.number().optional().nullable(),
})

type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>

export const createAttachment = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: CreateAttachmentInput) => CreateAttachmentSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    if (data.attachToAllSubjectLessons && data.subjectId && data.gradeId) {
      // Create subject-wide attachment
      const [attachment] = await db
        .insert(lessonsContentFile)
        .values({
          lessonId: null, // No specific lesson
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileTitle: data.fileTitle || data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          hasEmbeddings: false,
          isSubjectWide: true,
          subjectId: data.subjectId,
          gradeId: data.gradeId,
          seriesId: data.seriesId ?? null,
        })
        .returning({ id: lessonsContentFile.id })

      return { id: attachment?.id, success: true, isSubjectWide: true }
    }

    // Create single-lesson attachment (existing behavior)
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
        isSubjectWide: false,
      })
      .returning({ id: lessonsContentFile.id })

    return { id: attachment?.id, success: true, isSubjectWide: false }
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

// Promote attachment to subject-wide
const PromoteAttachmentSchema = z.object({
  attachmentId: z.number(),
  subjectId: z.number(),
  gradeId: z.number(),
  seriesId: z.number().optional().nullable(),
})

type PromoteAttachmentInput = z.infer<typeof PromoteAttachmentSchema>

export const promoteToSubjectWide = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: PromoteAttachmentInput) => PromoteAttachmentSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    // Update the attachment to be subject-wide
    const [updated] = await db
      .update(lessonsContentFile)
      .set({
        isSubjectWide: true,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        seriesId: data.seriesId ?? null,
        lessonId: null, // Remove specific lesson association
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessonsContentFile.id, data.attachmentId))
      .returning({ id: lessonsContentFile.id })

    if (!updated) {
      throw new Error('Pièce jointe non trouvée')
    }

    return { success: true, id: updated.id }
  })

// Demote subject-wide attachment to single lesson
const DemoteAttachmentSchema = z.object({
  attachmentId: z.number(),
  lessonId: z.number(),
})

type DemoteAttachmentInput = z.infer<typeof DemoteAttachmentSchema>

export const demoteToLesson = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator((data: DemoteAttachmentInput) => DemoteAttachmentSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    // Update the attachment to be lesson-specific
    const [updated] = await db
      .update(lessonsContentFile)
      .set({
        isSubjectWide: false,
        subjectId: null,
        gradeId: null,
        seriesId: null,
        lessonId: data.lessonId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lessonsContentFile.id, data.attachmentId))
      .returning({ id: lessonsContentFile.id })

    if (!updated) {
      throw new Error('Pièce jointe non trouvée')
    }

    return { success: true, id: updated.id }
  })

// Get available subject-wide attachments that can be linked to a lesson
const GetAvailableAttachmentsSchema = z.object({
  subjectId: z.number(),
  gradeId: z.number(),
  seriesId: z.number().optional().nullable(),
  excludeLessonId: z.number().optional(), // Exclude attachments already linked to this lesson
})

type GetAvailableAttachmentsInput = z.infer<typeof GetAvailableAttachmentsSchema>

export const getAvailableSubjectAttachments = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .inputValidator((data: GetAvailableAttachmentsInput) => GetAvailableAttachmentsSchema.parse(data))
  .handler(async ({ data }) => {
    initAdminDb()
    const db = getDb()

    // Get subject-wide attachments for this subject/grade
    const attachments = await db
      .select({
        id: lessonsContentFile.id,
        fileUrl: lessonsContentFile.fileUrl,
        fileName: lessonsContentFile.fileName,
        fileTitle: lessonsContentFile.fileTitle,
        fileType: lessonsContentFile.fileType,
        hasEmbeddings: lessonsContentFile.hasEmbeddings,
        createdAt: lessonsContentFile.createdAt,
      })
      .from(lessonsContentFile)
      .where(
        data.seriesId
          ? sql`${lessonsContentFile.isSubjectWide} = true 
              AND ${lessonsContentFile.subjectId} = ${data.subjectId} 
              AND ${lessonsContentFile.gradeId} = ${data.gradeId}
              AND (${lessonsContentFile.seriesId} = ${data.seriesId} OR ${lessonsContentFile.seriesId} IS NULL)`
          : and(
            eq(lessonsContentFile.isSubjectWide, true),
            eq(lessonsContentFile.subjectId, data.subjectId),
            eq(lessonsContentFile.gradeId, data.gradeId)
          )
      )
      .orderBy(desc(lessonsContentFile.createdAt))

    return attachments
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
