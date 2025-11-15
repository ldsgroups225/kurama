import { describe, expect, it } from 'vitest'
import { app } from './app'

describe('hono App', () => {
  it('should respond with "Hello World" for root route', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello World')
  })

  it('should return 404 for non-existent routes', async () => {
    const res = await app.request('/non-existent')
    expect(res.status).toBe(404)
  })
})
