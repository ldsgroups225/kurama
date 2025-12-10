---
name: Code Review
description: Perform comprehensive code review on staged changes
trigger: manual
---

When triggered, perform a comprehensive code review on staged changes:

1. **Get staged changes**:
   ```bash
   git diff --staged
   ```

2. **Review for code quality**:
   - Clear variable/function names
   - Proper TypeScript types (no `any`)
   - Consistent formatting
   - Appropriate comments and JSDoc
   - Single responsibility principle

3. **Review for Kurama conventions**:
   - Semantic color utilities (no inline Tailwind colors)
   - Server functions called with `{ data: value }` format
   - Route files named correctly (`.index.tsx` for parents)
   - Components follow structure pattern
   - Import aliases used correctly (`@/*`)

4. **Review for security**:
   - No hardcoded secrets or API keys
   - Input validation present
   - Error messages don't expose internals
   - Authentication checks in place
   - Proper data sanitization

5. **Review for performance**:
   - No unnecessary re-renders
   - Proper memoization with `useMemo`/`useCallback`
   - Efficient database queries
   - Lazy loading where appropriate
   - Bundle size impact considered

6. **Review for accessibility**:
   - ARIA labels on icon-only buttons
   - Keyboard navigation support
   - Semantic HTML elements
   - Color contrast compliance
   - Screen reader compatibility

7. **Review for testing**:
   - Tests exist for new functionality
   - Edge cases covered
   - Accessibility tests included
   - Mock usage appropriate

8. **Provide detailed feedback**:
   - List specific issues with file/line references
   - Suggest concrete improvements
   - Highlight good practices used
   - Provide approval status (ready/needs changes)
   - Include severity levels (critical/major/minor)

9. **Check for common issues**:
   - Console.log statements left in code
   - Unused imports or variables
   - Missing error handling
   - Inconsistent naming conventions
   - Duplicate code that could be extracted
