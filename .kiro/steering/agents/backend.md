---
inclusion: fileMatch
fileMatchPattern: "apps/data-service/**/*.{ts,tsx}"
---

# Backend Development Guide (Hono + Cloudflare Workers)

## Hono API Patterns

### Route Definition
```typescript
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const app = new Hono<{ Bindings: Env }>()

// GET endpoint
app.get("/api/users/:id", async (c) => {
  const id = c.req.param("id")
  const user = await getUser(id)
  
  if (!user) {
    return c.json({ error: "User not found" }, 404)
  }
  
  return c.json(user)
})

// POST with validation
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

app.post("/api/users", zValidator("json", createUserSchema), async (c) => {
  const data = c.req.valid("json")
  const user = await createUser(data)
  return c.json(user, 201)
})
```

### Middleware
```typescript
import { cors } from "hono/cors"
import { logger } from "hono/logger"

app.use("*", logger())
app.use("/api/*", cors({
  origin: ["https://kurama.yeko.workers.dev"],
  credentials: true,
}))

// Custom auth middleware
app.use("/api/*", async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  
  const user = await verifyToken(token)
  c.set("user", user)
  await next()
})
```

### Error Handling
```typescript
app.onError((err, c) => {
  console.error("Error:", err)
  
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  
  return c.json({ error: "Internal Server Error" }, 500)
})

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404)
})
```

## Cloudflare Workers

### Environment Bindings
```typescript
interface Env {
  DATABASE_URL: string
  AUTH_SECRET: string
  POLAR_ACCESS_TOKEN: string
  // KV Namespace
  CACHE: KVNamespace
  // Durable Object (planned)
  SESSIONS: DurableObjectNamespace
}
```

### Worker Entry
```typescript
// src/index.ts
import { app } from "./hono/app"

export default {
  fetch: app.fetch,
}
```

## Testing
```typescript
import { describe, it, expect } from "vitest"
import { app } from "./app"

describe("API", () => {
  it("GET /health returns 200", async () => {
    const res = await app.request("/health")
    expect(res.status).toBe(200)
  })

  it("POST /api/users creates user", async () => {
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", name: "Test" }),
    })
    
    expect(res.status).toBe(201)
  })
})
```

## Commands
```bash
pnpm run dev:kurama-backend     # Dev server
pnpm run deploy:kurama-backend  # Deploy to Workers
pnpm run cf-typegen             # Generate Cloudflare types
```

## Best Practices
- Use Zod for request validation
- Return proper HTTP status codes
- Log errors for debugging
- Use environment bindings for secrets
- Test all endpoints
