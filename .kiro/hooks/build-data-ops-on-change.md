---
name: Build Data Ops on Change
description: Rebuild @kurama/data-ops when shared package files change
trigger: onFileSave
pattern: "packages/data-ops/src/**/*.ts"
action: shell
command: "pnpm run build:data-ops"
---

Automatically rebuild the @kurama/data-ops shared package when its source files change.

This is critical because:
- Frontend and backend apps depend on this package
- Changes won't be reflected until the package is rebuilt
- Prevents "module not found" errors during development

After rebuild, the apps will automatically pick up the changes.
