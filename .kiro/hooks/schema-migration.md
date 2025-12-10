---
name: Schema Migration Reminder
description: Remind to generate migrations when schema files change
trigger: onFileSave
pattern: "packages/data-ops/src/drizzle/schema.ts"
action: agent
---

When the database schema file is modified:

1. Analyze the changes made:
   - New tables added
   - Columns modified
   - Relations changed
   - Indexes added/removed

2. Remind the developer to:
   - Generate a new migration: `pnpm run --filter @kurama/data-ops drizzle:generate`
   - Review the generated migration SQL
   - Apply the migration: `pnpm run --filter @kurama/data-ops drizzle:migrate`

3. If Better Auth tables were modified:
   - Run: `pnpm run --filter @kurama/data-ops better-auth:generate`

4. Check for potential issues:
   - Breaking changes (column removal, type changes)
   - Missing indexes on frequently queried columns
   - Proper foreign key relationships

5. Suggest updating seed files if new tables were added
