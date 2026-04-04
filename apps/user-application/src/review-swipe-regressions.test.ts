import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const appRoot = process.cwd()

function readAppFile(relativePath: string) {
  return readFileSync(join(appRoot, relativePath), 'utf8')
}

describe('swipe regressions', () => {
  test('swipe handler compares against the live motion value before deciding completion', () => {
    const swipeHandler = readAppFile('src/hooks/use-swipe-handler.ts')

    expect(swipeHandler).toContain('const finalX = x.get()')
    expect(swipeHandler).toContain('finalX >= SWIPE_THRESHOLD')
    expect(swipeHandler).toContain('finalX <= -SWIPE_THRESHOLD')
  })
})
