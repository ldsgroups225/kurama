import { desc, eq } from '@kurama/data-ops/database/drizzle-orm'
import { getDb } from '@kurama/data-ops/database/setup'
import { authUser, userProfiles } from '@kurama/data-ops/drizzle/schema'
import { createServerFn } from '@tanstack/react-start'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

export const getLeaderboard = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .handler(async ({ context }) => {
    const db = getDb()
    const userId = context.userId

    const topUsers = await db
      .select({
        userId: userProfiles.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        xp: userProfiles.xp,
        image: authUser.image,
      })
      .from(userProfiles)
      .innerJoin(authUser, eq(userProfiles.userId, authUser.id))
      .orderBy(desc(userProfiles.xp))
      .limit(10)

    return topUsers.map((u, index) => ({
      id: u.userId,
      name: `${u.firstName} ${u.lastName}`,
      points: u.xp,
      rank: index + 1,
      isCurrentUser: u.userId === userId,
      avatar: u.image ?? undefined,
    }))
  })
