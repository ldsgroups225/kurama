import type { PanInfo } from 'motion/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createSwipeHandlers } from './use-swipe-handler'

const { animateMock } = vi.hoisted(() => ({
  animateMock: vi.fn((_: unknown, __: number, options?: { onComplete?: () => void }) => {
    options?.onComplete?.()
  }),
}))

vi.mock('motion/react', () => ({
  animate: animateMock,
}))

function createMotionValue(initial: number) {
  let current = initial

  return {
    get: () => current,
    set: (value: number) => {
      current = value
    },
  }
}

function createPanInfo(offsetX: number, velocityX = 0): PanInfo {
  return {
    point: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
    offset: { x: offsetX, y: 0 },
    velocity: { x: velocityX, y: 0 },
  }
}

describe('createSwipeHandlers', () => {
  beforeEach(() => {
    animateMock.mockClear()
    vi.useFakeTimers()
  })

  test('regression: completes a right swipe when the live card position crossed the threshold', () => {
    const x = createMotionValue(90)
    const onCorrect = vi.fn()
    const onIncorrect = vi.fn()
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()

    const { handleDragStart, handleDragEnd } = createSwipeHandlers({
      x: x as never,
      onCorrect,
      onIncorrect,
      onDragStart,
      onDragEnd,
    })

    handleDragStart()
    handleDragEnd({} as MouseEvent, createPanInfo(79))

    expect(onDragStart).toHaveBeenCalledTimes(1)
    expect(animateMock).toHaveBeenCalledWith(
      x,
      250,
      expect.objectContaining({ duration: 0.15, ease: 'easeOut' }),
    )
    expect(onCorrect).toHaveBeenCalledTimes(1)
    expect(onIncorrect).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(onDragEnd).toHaveBeenCalledTimes(1)
  })

  test('returns the card to center when neither offset nor live position crosses the threshold', () => {
    const x = createMotionValue(40)
    const onCorrect = vi.fn()
    const onIncorrect = vi.fn()

    const handlers = createSwipeHandlers({
      x: x as never,
      onCorrect,
      onIncorrect,
      onDragStart: vi.fn(),
      onDragEnd: vi.fn(),
    })

    handlers.handleDragEnd({} as MouseEvent, createPanInfo(40))

    expect(animateMock).toHaveBeenCalledWith(
      x,
      0,
      expect.objectContaining({ type: 'spring', stiffness: 300, damping: 30 }),
    )
    expect(onCorrect).not.toHaveBeenCalled()
    expect(onIncorrect).not.toHaveBeenCalled()
  })
})
