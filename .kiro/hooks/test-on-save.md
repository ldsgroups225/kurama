---
name: Run Tests on Save
description: Automatically run related tests when source files are saved
trigger: onFileSave
pattern: "apps/**/*.{ts,tsx}"
action: agent
---

When a TypeScript/React file is saved in the apps directory:

1. Identify if there's a corresponding test file:
   - For `component.tsx` → look for `component.test.tsx` or `__tests__/component.test.tsx`
   - For `function.ts` → look for `function.test.ts`

2. If a test file exists:
   - Run the specific test: `pnpm test -- --run <test-file-path>`
   - Report test results (pass/fail)
   - If tests fail, suggest fixes

3. If no test file exists and the file contains:
   - A React component → suggest creating a component test
   - A server function → suggest creating a function test
   - A utility function → suggest creating a unit test

4. Skip test suggestions for:
   - Type definition files (`.d.ts`)
   - Configuration files
   - Index/barrel files
