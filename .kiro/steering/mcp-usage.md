# MCP (Model Context Protocol) Usage

Use MCP tools proactively to enhance development workflow.

## Available Servers

### Exa MCP
**Purpose**: Web search and code context

**Use for**:
- Latest documentation and best practices
- Real-world usage patterns (TanStack, Hono, Better Auth)
- API/SDK context and frameworks
- Technical problem solutions

**Tools**:
- `mcp_exa_web_search_exa`: General web search
- `mcp_exa_get_code_context_exa`: Code examples and patterns

**Examples**: TanStack routing, Better Auth OAuth, Polar SDK, Drizzle ORM

### Context7 MCP
**Purpose**: Official library documentation

**Use for**:
- Official docs for libraries/frameworks
- API references and guides
- Library-specific patterns

**Tools**:
- `mcp_context7_resolve_library_id`: Find library ID
- `mcp_context7_get_library_docs`: Fetch documentation

**Examples**: TanStack Start/Router, Drizzle ORM, Hono, Better Auth, Tailwind CSS v4

### Git MCP
**Purpose**: Git operations and repository inspection

**Use for**:
- Repository status and changes
- Commit history
- Branch management
- Diff inspection

**Tools**:
- `mcp_git_git_status`: Working tree status
- `mcp_git_git_diff_unstaged`: Unstaged changes
- `mcp_git_git_diff_staged`: Staged changes
- `mcp_git_git_log`: Commit history
- `mcp_git_git_add`: Stage files
- `mcp_git_git_commit`: Commit changes
- `mcp_git_git_create_branch`: Create branch
- `mcp_git_git_checkout`: Switch branch

### Time MCP
**Purpose**: Timezone conversions and current time

**Use for**:
- Timestamps and scheduling
- Timezone conversions
- Current time in specific timezone

**Tools**:
- `mcp_time_get_current_time`: Get current time
- `mcp_time_convert_time`: Convert between timezones

### Chrome DevTools MCP
**Purpose**: Browser automation and testing

**Use for**:
- Testing kurama-frontend in browser
- Debugging UI and auth flows
- Screenshots and page structure
- Network request inspection
- PWA and offline testing
- Performance analysis

**Tools**:
- `mcp_chrome_devtools_navigate_page`: Navigate URLs
- `mcp_chrome_devtools_take_snapshot`: Page structure
- `mcp_chrome_devtools_take_screenshot`: Capture visuals
- `mcp_chrome_devtools_click`: Interact with elements
- `mcp_chrome_devtools_fill`: Fill form inputs
- `mcp_chrome_devtools_list_network_requests`: Inspect API calls
- `mcp_chrome_devtools_list_console_messages`: Console logs
- `mcp_chrome_devtools_performance_start_trace`: Performance trace

### Shadcn MCP
**Purpose**: shadcn/ui component management

**Use for**:
- Adding new shadcn/ui components
- Finding component examples
- Viewing implementation details
- Radix UI patterns
- Component compatibility

**Tools**:
- `mcp_shadcn_search_items_in_registries`: Search components
- `mcp_shadcn_view_items_in_registries`: View details
- `mcp_shadcn_get_item_examples_from_registries`: Get examples
- `mcp_shadcn_get_add_command_for_items`: Get add command
- `mcp_shadcn_get_audit_checklist`: Verify setup

## Workflow Integration

### Before Starting
1. Git MCP: Check repository status
2. Exa MCP: Research unfamiliar patterns
3. Context7 MCP: Official documentation

### During Development
1. Shadcn MCP: Adding UI components
2. Exa MCP: Code examples and best practices
3. Git MCP: Track changes incrementally

### Testing & Verification
1. Chrome DevTools MCP: Test kurama-frontend
2. Git MCP: Review diffs before committing
3. Shadcn MCP: Audit checklist after components
4. Test auth flows and Polar integration
5. Verify PWA and offline capabilities

### When Stuck
1. Exa MCP: Search for solutions
2. Context7 MCP: Library documentation
3. Chrome DevTools MCP: Debug runtime issues

## Best Practices

- Use MCP tools proactively
- Combine tools (Exa + Context7 for research)
- Verify work with Chrome DevTools
- Stay current with Exa MCP
- Review changes before committing
- Remember package names: kurama-frontend, kurama-backend, @kurama/data-ops
- Always build data-ops before running apps
