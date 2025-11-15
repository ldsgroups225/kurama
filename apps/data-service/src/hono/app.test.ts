import { describe, expect } from 'vitest'
import { app } from './app'

describe('hono App', () => {
  test('should respond with "Hello World" for root route', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    await expect(res.text()).resolves.toBe('Hello World')
  })

  test('should return 404 for non-existent routes', async () => {
    const res = await app.request('/non-existent')
    expect(res.status).toBe(404)
  })
})
