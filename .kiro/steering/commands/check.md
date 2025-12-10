---
inclusion: manual
---

# Quality Check

Run comprehensive quality checks to ensure code is production-ready and follows Kurama standards.

## Quality Check Process

### 1. TypeScript Validation
```bash
pnpm run typecheck
```

**Checks for**:
- Type errors across all packages
- Strict mode compliance
- Import/export correctness
- Generic type usage
- Interface implementations

**Common Issues**:
- Missing return types
- `any` type usage
- Incorrect generic constraints
- Import path errors

### 2. Code Linting
```bash
# Auto-fix issues
pnpm run lint:fix

# Check without fixing
pnpm run lint
```

**Checks for**:
- ESLint rule violations
- Import ordering
- Unused variables/imports
- Code style consistency
- Best practice violations

**Kurama-Specific Rules**:
- No inline Tailwind colors
- Proper server function calls
- Component naming conventions
- Accessibility requirements

### 3. Test Execution
```bash
# Run all tests
pnpm test -- --run

# Run with coverage
pnpm test -- --run --coverage
```

**Checks for**:
- Unit test failures
- Integration test failures
- Component test failures
- Server function test failures

**Coverage Goals**:
- Unit tests: > 80%
- Critical paths: 100%
- Components: > 85%

### 4. Build Verification
```bash
# Build shared package
pnpm run build:data-ops

# Build frontend
pnpm run --filter kurama-frontend build

# Build backend
pnpm run --filter kurama-backend build
```

**Checks for**:
- Compilation errors
- Missing dependencies
- Build configuration issues
- Asset generation

### 5. Bundle Analysis
```bash
pnpm run perf:check-bundles
```

**Checks for**:
- Bundle size limits
- Code splitting effectiveness
- Unused dependencies
- Large asset files

**Performance Budgets**:
- Main bundle: < 200KB
- Vendor bundle: < 300KB
- Route chunks: < 50KB each

### 6. Security Scan

**Manual Checks**:
- No hardcoded secrets in code
- Environment variables properly used
- Input validation present
- Error messages don't expose internals

**Files to Check**:
```bash
# Search for potential secrets
grep -r "sk_\|pk_\|api_key\|password" --exclude-dir=node_modules .
```

### 7. Accessibility Validation

**Component Checks**:
- Icon buttons have `aria-label`
- Interactive elements are keyboard accessible
- Proper semantic HTML usage
- Color contrast compliance

**Testing**:
```tsx
// Example accessibility test
import { axe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

it("has no accessibility violations", async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 8. Database Schema Validation

**Checks**:
- Migrations are up to date
- Schema matches code expectations
- Foreign key relationships correct
- Indexes on frequently queried columns

```bash
# Generate and check migrations
pnpm run --filter @kurama/data-ops drizzle:generate

# Verify no pending migrations
```

## Automated Quality Check Script

Create a comprehensive check:
```bash
#!/bin/bash
set -e

echo "🔍 Running quality checks..."

echo "📝 TypeScript check..."
pnpm run typecheck

echo "🧹 Linting..."
pnpm run lint:fix

echo "🧪 Running tests..."
pnpm test -- --run

echo "🏗️ Building packages..."
pnpm run build:data-ops

echo "📦 Checking bundle size..."
pnpm run perf:check-bundles

echo "✅ All quality checks passed!"
```

## Pre-Commit Checklist

Before committing code:
- [ ] TypeScript compiles without errors
- [ ] All linting rules pass
- [ ] Tests pass with good coverage
- [ ] Build succeeds
- [ ] Bundle size within limits
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets
- [ ] Accessibility requirements met
- [ ] Database migrations generated if needed

## Pre-Deployment Checklist

Before deploying:
- [ ] All quality checks pass
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Critical user flows tested
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated

## Quality Metrics

### Code Quality
- TypeScript strict mode: ✅
- ESLint compliance: 100%
- Test coverage: > 80%
- Bundle size: Within budget

### Performance
- Build time: < 30s
- Test execution: < 60s
- Bundle analysis: < 10s

### Security
- No secrets in code: ✅
- Input validation: ✅
- Error handling: ✅
- HTTPS only: ✅

## Continuous Integration

For CI/CD pipeline:
```yaml
# Example GitHub Actions
- name: Quality Check
  run: |
    pnpm run typecheck
    pnpm run lint
    pnpm test -- --run
    pnpm run build:data-ops
    pnpm run perf:check-bundles
```

## Troubleshooting Common Issues

### TypeScript Errors
- Check import paths
- Verify type definitions
- Update dependencies
- Clear TypeScript cache

### Test Failures
- Check test environment setup
- Verify mock configurations
- Update test data
- Check async test handling

### Build Failures
- Clear node_modules and reinstall
- Check dependency versions
- Verify build configuration
- Check for circular dependencies

### Bundle Size Issues
- Analyze bundle composition
- Remove unused dependencies
- Implement code splitting
- Optimize asset loading
