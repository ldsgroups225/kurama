---
inclusion: fileMatch
fileMatchPattern: "**/*.test.{ts,tsx}"
---

# Testing Guide

## Vitest + Testing Library

### Component Tests
```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Component } from "./component"

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component title="Test" />, { wrapper: createWrapper() })
    expect(screen.getByText("Test")).toBeInTheDocument()
  })

  it("handles user interaction", async () => {
    const onAction = vi.fn()
    render(<Component title="Test" onAction={onAction} />, { wrapper: createWrapper() })
    
    fireEvent.click(screen.getByRole("button"))
    
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledOnce()
    })
  })

  it("shows loading state", () => {
    render(<Component title="Test" isLoading />, { wrapper: createWrapper() })
    expect(screen.getByTestId("skeleton")).toBeInTheDocument()
  })
})
```

### Server Function Tests
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"
import { getProfile, createProfile } from "./profile-functions"

describe("Profile Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns user profile", async () => {
    const profile = await getProfile({ data: "user-123" })
    
    expect(profile).toBeDefined()
    expect(profile?.userId).toBe("user-123")
  })

  it("creates new profile", async () => {
    const newProfile = await createProfile({
      data: { userId: "user-123", gradeId: "grade-1", type: "student" }
    })
    
    expect(newProfile.id).toBeDefined()
  })
})
```

### API Tests (Hono)
```typescript
import { describe, it, expect } from "vitest"
import { app } from "./app"

describe("API Routes", () => {
  it("GET /health returns 200", async () => {
    const res = await app.request("/health")
    expect(res.status).toBe(200)
  })

  it("POST /api/data creates resource", async () => {
    const res = await app.request("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    })
    
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBeDefined()
  })
})
```

## Test Commands
```bash
pnpm test                    # Run all tests
pnpm test -- --watch         # Watch mode
pnpm test -- --coverage      # With coverage
pnpm test -- --run           # Single run (CI)
```

## Testing Patterns

### Mocking
```typescript
// Mock module
vi.mock("@kurama/data-ops/database/setup", () => ({
  getDb: vi.fn(() => mockDb),
}))

// Mock function
const mockFn = vi.fn().mockResolvedValue({ id: "123" })

// Spy on method
const spy = vi.spyOn(object, "method")
```

### Async Testing
```typescript
// Wait for element
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument()
})

// Wait for async operation
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled()
}, { timeout: 5000 })
```

### Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

it("has no accessibility violations", async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Coverage Goals
- Unit tests: > 80%
- Integration tests: Critical paths
- E2E tests: User journeys
