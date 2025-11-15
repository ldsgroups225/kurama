import { describe, expect, test } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  test('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  test('should handle conflicting classes by keeping the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  test('should handle conditional classes', () => {
    expect(cn('base-class', true && 'active', false && 'inactive')).toBe('base-class active')
  })

  test('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  test('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3')
  })
})
