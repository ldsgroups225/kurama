import { eq } from '@kurama/data-ops/database/drizzle-orm'
import { userProfiles } from '@kurama/data-ops/drizzle/schema'

/**
 * Helper function to get user's grade ID
 */
export async function getUserGradeId(db: any, userId: string): Promise<number | null> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { gradeId: true },
  })
  return profile?.gradeId ?? null
}
