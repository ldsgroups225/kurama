---
name: TypeScript Check on Save
description: Run type checking when TypeScript files are saved
trigger: onFileSave
pattern: "**/*.{ts,tsx}"
action: shell
command: "pnpm run typecheck"
---

Automatically run TypeScript type checking when any TypeScript file is saved.

This ensures:
- No type errors are introduced
- Strict mode compliance is maintained
- Import/export issues are caught early

If type errors are found, the output will show:
- File and line number
- Error description
- Suggested fix when available
