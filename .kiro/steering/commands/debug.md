---
inclusion: manual
---

# Debug Issue

Systematically debug issues using proven debugging methodologies and Kurama-specific troubleshooting.

## Debugging Process

### 1. Issue Documentation
First, clearly document the problem:
- **Expected behavior**: What should happen?
- **Actual behavior**: What is happening instead?
- **Reproduction steps**: How to trigger the issue?
- **Environment**: Browser, device, network conditions
- **Recent changes**: What was modified recently?

### 2. Initial Checks

#### Build and Type Issues
```bash
# Check for type errors
pnpm run typecheck

# Check for linting issues
pnpm run lint:fix

# Rebuild shared package
pnpm run build:data-ops

# Run tests
pnpm test
```

#### Browser Console
- Check for JavaScript errors
- Look for network request failures
- Examine console warnings
- Check for CORS issues

### 3. Kurama-Specific Issues

#### Server Function Problems
```tsx
// ❌ Common mistake
const result = await getProfile(userId)

// ✅ Correct format
const result = await getProfile({ data: userId })

// Check input validator matches
export const getProfile = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data) // Must match call format
  .handler(async ({ data: userId }) => {
    // Implementation
  })
```

#### Route Issues
```tsx
// Check file naming:
// - Parent routes need .index.tsx: subjects.index.tsx
// - Dynamic routes use $: subjects.$subjectId.tsx
// - Layout routes: _auth/route.tsx

// Verify route structure in routeTree.gen.ts
```

#### Styling Problems
```tsx
// ❌ Inline colors don't work with theme switching
<div className="bg-gradient-to-br from-blue-400 to-blue-600">

// ✅ Use semantic colors
<div className="bg-gradient-level">

// Check if semantic color is defined in styles.css
```

#### Authentication Issues
```tsx
// Check session state
const { user, isAuthenticated, isLoading } = useAuth()

// Verify middleware is applied
// Check redirect logic in beforeLoad
// Ensure auth context is provided
```

### 4. Systematic Debugging

#### Binary Search Method
1. Identify the last working state
2. Find the midpoint between working and broken
3. Test if midpoint works
4. Narrow down to the exact change

#### Isolation Technique
1. Create minimal reproduction
2. Remove unrelated code
3. Test with simplified data
4. Isolate the specific component/function

#### Logging Strategy
```tsx
// Add strategic console.logs
console.log("Input:", data)
console.log("Query result:", result)
console.log("State:", state)

// Use debugger statements
debugger; // Pauses execution in browser

// Check network requests in DevTools
```

### 5. Database Issues

#### Query Problems
```tsx
// Check query syntax
const result = await db.query.users.findFirst({
  where: eq(users.id, userId), // Verify column names
  with: { profile: true }, // Check relations exist
})

// Verify database connection
// Check migration status
// Examine seed data
```

#### Migration Issues
```bash
# Generate new migration
pnpm run --filter @kurama/data-ops drizzle:generate

# Check migration files
# Apply migrations
pnpm run --filter @kurama/data-ops drizzle:migrate
```

### 6. Performance Debugging

#### Bundle Analysis
```bash
pnpm run perf:check-bundles
```

#### React DevTools
- Check component re-renders
- Examine state changes
- Profile component performance

#### Network Analysis
- Check request/response times
- Look for unnecessary requests
- Verify caching headers

### 7. Common Kurama Patterns

#### Data Fetching
```tsx
// Ensure proper error handling
const { data, isLoading, error } = useQuery({
  queryKey: ["key"],
  queryFn: fetchData,
  retry: 3,
  staleTime: 5 * 60 * 1000,
})

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
```

#### Form Validation
```tsx
// Check Zod schema matches form data
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: initialValues,
})

// Verify validation messages
// Check form submission handler
```

### 8. Production Debugging

#### Error Monitoring
- Check Cloudflare Workers logs
- Examine error tracking service
- Review user reports

#### Performance Monitoring
- Check Core Web Vitals
- Monitor API response times
- Analyze user behavior

### 9. Documentation and Prevention

#### Document the Fix
- Record the root cause
- Document the solution
- Add to troubleshooting guide
- Create test to prevent regression

#### Preventive Measures
- Add error boundaries
- Improve error messages
- Add monitoring/alerts
- Update documentation

### 10. When to Ask for Help

If after systematic debugging you're still stuck:
- Provide clear reproduction steps
- Share relevant code snippets
- Include error messages and logs
- Explain what you've already tried
