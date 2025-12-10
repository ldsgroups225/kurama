---
inclusion: manual
---

# Refactor Code

Systematically refactor code to improve quality, maintainability, and performance.

See `.kiro/steering/agents/refactoring.md` for detailed patterns and techniques.

## Quick Process

### 1. Analyze
- Identify code smells (long methods, large classes, duplicated code)
- Check for performance bottlenecks
- Review type safety and accessibility

### 2. Plan
- Ensure tests exist and pass
- Commit current working state
- Understand code's purpose

### 3. Execute
- Make small, incremental changes
- Run tests after each change
- Commit frequently

### 4. Verify
- All tests pass
- No type errors: `pnpm run typecheck`
- No lint errors: `pnpm run lint:fix`
- Performance not degraded
- Behavior unchanged

### 5. Document
- Update component documentation
- Add JSDoc comments
- Update README if needed
