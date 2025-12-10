# Kiro Configuration for Kurama

Comprehensive Kiro IDE setup with steering files, hooks, and slash commands for the Kurama project.

## Structure

### Steering Files (Context-Aware Guidance)

#### Always-Included (Auto-Load)
- `conventions.md` - Coding standards and best practices
- `tech.md` - Tech stack and commands
- `structure.md` - Project structure and organization
- `product.md` - Product features and status
- `deployment.md` - Deployment procedures
- `learning-flow.md` - Learning system details
- `mcp-usage.md` - MCP tools and usage

#### Agent-Specific (Auto-Load by File Type)
Located in `.kiro/steering/agents/`:
- `frontend.md` - TanStack Start, React patterns (frontend files)
- `backend.md` - Hono, Cloudflare Workers (backend files)
- `database.md` - Drizzle ORM, migrations (data-ops files)
- `testing.md` - Vitest, Testing Library (test files)
- `ui-components.md` - shadcn/ui, Radix patterns (component files)
- `payments.md` - Polar SDK integration (payment files)
- `auth.md` - Better Auth patterns (auth files)
- `pwa.md` - Workbox, Dexie, offline (PWA files)
- `typescript.md` - TypeScript best practices (all TS files)
- `refactoring.md` - Refactoring patterns (all files)

#### Manual Commands (Slash Commands)
Located in `.kiro/steering/commands/`:
- `/check` - Run all quality checks
- `/create` - Create components, routes, tests, schemas
- `/debug` - Debug issues systematically
- `/deploy` - Deploy to Cloudflare
- `/refactor` - Refactor code systematically

### Hooks (Automated Workflows)

#### On-Save Hooks
- `lint-fix-on-save.md` - Auto-fix linting
- `typecheck-on-save.md` - Type checking
- `test-on-save.md` - Run related tests
- `build-data-ops-on-change.md` - Rebuild shared package
- `schema-migration.md` - Remind to generate migrations
- `security-scan.md` - Scan for security issues

#### Manual Hooks
Located in `.kiro/hooks/manual/`:
- `code-review.md` - Comprehensive code review
- `readme-update.md` - Update documentation

## Usage

### Steering Files
Automatically included based on file type. Reference them in chat:
- Always available: `conventions.md`, `tech.md`, etc.
- Auto-loaded: When editing frontend/backend/test files
- Manual: Use `/` in chat to access command steering files

### Slash Commands
Type `/` in Kiro chat to see available commands:
- `/check` - Quality checks
- `/create` - Create new files
- `/debug` - Debug issues
- `/deploy` - Deploy application
- `/refactor` - Refactor code

### Hooks
- **On-Save**: Automatically trigger when files are saved
- **Manual**: Trigger via hook UI or command palette

## Key Features

### Comprehensive Coverage
- 10 agent-specific steering files for different domains
- 5 manual slash commands for common tasks
- 6 on-save hooks for automation
- 2 manual hooks for code review and documentation

### No Duplication
- Refactoring patterns in one place (agents/refactoring.md)
- Create commands consolidated (commands/create.md)
- Boilerplate generation removed (covered in steering)
- Redundant commands removed

### Lean and Focused
- Commands reference steering files instead of duplicating
- Hooks focus on automation, not documentation
- Steering files are single-source-of-truth
- Clear separation of concerns

## Best Practices

### When to Use Each

**Steering Files**:
- Reference for patterns and conventions
- Auto-loaded based on context
- Always available in chat

**Slash Commands**:
- Quick access to common workflows
- Manual triggers for specific tasks
- Lean references to detailed steering

**Hooks**:
- Automate repetitive tasks
- Enforce quality standards
- Reduce manual overhead

### Workflow

1. **Start coding** - Steering files auto-load based on file type
2. **Need guidance** - Reference steering files or use `/` commands
3. **Quality checks** - Use `/check` or let on-save hooks run
4. **Code review** - Use manual `/code-review` hook
5. **Deploy** - Use `/deploy` command

## Maintenance

### Adding New Guidance
1. Add to appropriate steering file (agents/ or commands/)
2. Use `inclusion: fileMatch` for auto-loading
3. Use `inclusion: manual` for slash commands
4. Reference from other files to avoid duplication

### Removing Duplication
- Check if content exists in steering files
- Commands should reference steering, not duplicate
- Hooks should automate, not document
- Use cross-references instead of copying

### Updating Patterns
- Update in steering file (single source)
- Commands reference the steering file
- Hooks use the patterns from steering

## File Organization

```
.kiro/
├── steering/
│   ├── agents/              # Auto-load by file type
│   │   ├── frontend.md
│   │   ├── backend.md
│   │   ├── database.md
│   │   ├── testing.md
│   │   ├── ui-components.md
│   │   ├── payments.md
│   │   ├── auth.md
│   │   ├── pwa.md
│   │   ├── typescript.md
│   │   └── refactoring.md
│   ├── commands/            # Manual slash commands
│   │   ├── check.md
│   │   ├── create.md
│   │   ├── debug.md
│   │   ├── deploy.md
│   │   └── refactor.md
│   └── [always-included]    # Auto-load for all files
│       ├── conventions.md
│       ├── tech.md
│       ├── structure.md
│       ├── product.md
│       ├── deployment.md
│       ├── learning-flow.md
│       └── mcp-usage.md
├── hooks/
│   ├── [on-save]            # Auto-trigger on file save
│   │   ├── lint-fix-on-save.md
│   │   ├── typecheck-on-save.md
│   │   ├── test-on-save.md
│   │   ├── build-data-ops-on-change.md
│   │   ├── schema-migration.md
│   │   └── security-scan.md
│   └── manual/              # Manual triggers
│       ├── code-review.md
│       └── readme-update.md
└── README.md                # This file
```

## Statistics

- **Steering Files**: 17 total (7 always-included + 10 agent-specific)
- **Commands**: 5 manual slash commands
- **Hooks**: 8 total (6 on-save + 2 manual)
- **Total Files**: 30 configuration files
- **Duplication**: Eliminated through consolidation
