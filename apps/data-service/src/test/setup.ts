import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
vi.stubEnv('DATABASE_HOST', 'test-db-host')
vi.stubEnv('DATABASE_USERNAME', 'test-user')
vi.stubEnv('DATABASE_PASSWORD', 'test-password')

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => { })
vi.spyOn(console, 'debug').mockImplementation(() => { })
vi.spyOn(console, 'info').mockImplementation(() => { })
vi.spyOn(console, 'warn').mockImplementation(() => { })
vi.spyOn(console, 'error').mockImplementation(() => { })

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn())
