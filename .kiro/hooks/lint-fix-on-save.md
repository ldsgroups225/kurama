---
name: Lint Fix on Save
description: Automatically fix linting issues when files are saved
trigger: onFileSave
pattern: "**/*.{ts,tsx,js,jsx}"
action: shell
command: "pnpm run lint:fix"
---

Automatically run ESLint with auto-fix when JavaScript/TypeScript files are saved.

This ensures:
- Consistent code formatting
- Best practices are followed
- Import ordering is correct
- Unused imports are removed
