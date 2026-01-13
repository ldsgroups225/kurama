import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateCurrentStreak } from './streak'
import { studySessions } from '../drizzle/schema'

// Mock Drizzle ORM functions to return identifiable objects
vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual('drizzle-orm')
  return {
    ...actual,
    eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
    gte: vi.fn((col, val) => ({ type: 'gte', col, val })),
    gt: vi.fn((col, val) => ({ type: 'gt', col, val })),
    isNotNull: vi.fn((col) => ({ type: 'isNotNull', col })),
    and: vi.fn((...args) => ({ type: 'and', args })),
    desc: vi.fn(),
  }
})

describe('Streak Queries', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      then: vi.fn(), // to support await
    }
  })

  it('calculateCurrentStreak should build query with correct filters (endedAt IS NOT NULL)', async () => {
    // Mock the chain execution to return empty array
    mockDb.orderBy.mockResolvedValue([])

    await calculateCurrentStreak(mockDb, 'user-123')

    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.from).toHaveBeenCalledWith(studySessions)

    // Check the where clause
    const whereCall = mockDb.where.mock.calls[0][0]
    expect(whereCall.type).toBe('and')

    // We expect 4 conditions: userId, startedAt, endedAt != null, cardsReviewed > 0
    // plus optional mode (undefined here)
    const args = whereCall.args.filter((a: any) => a !== undefined)

    // Validating specific filters present
    const hasEndedAtCheck = args.some((a: any) => a.type === 'isNotNull')
    const hasCardsReviewedCheck = args.some((a: any) => a.type === 'gt')

    expect(hasEndedAtCheck).toBe(true)
    expect(hasCardsReviewedCheck).toBe(true)
  })

  it('calculateCurrentStreak should include mode filter when provided', async () => {
    mockDb.orderBy.mockResolvedValue([])

    await calculateCurrentStreak(mockDb, 'user-123', 'daily_challenge')

    const whereCall = mockDb.where.mock.calls[0][0]
    const args = whereCall.args

    const hasModeCheck = args.some((a: any) => a.type === 'eq' && a.val === 'daily_challenge')
    expect(hasModeCheck).toBe(true)
  })

  it('should calculate streak correctly from returned sessions', async () => {
    // Mock 2 consecutive days
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    mockDb.orderBy.mockResolvedValue([
      { startedAt: today.toISOString() },
      { startedAt: yesterday.toISOString() }
    ])

    const streak = await calculateCurrentStreak(mockDb, 'user-123')
    expect(streak).toBe(2)
  })
})
