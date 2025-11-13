# MCP (Model Context Protocol) Usage Guidelines

Kurama project has several MCP servers configured. Use them proactively in your workflow.

## Available MCP Servers

### Exa MCP
**Purpose**: Web search and code context retrieval

**When to use**:
- Searching for latest documentation, examples, or best practices
- Finding real-world usage patterns for TanStack Start, Hono, Better Auth
- Getting fresh context about APIs, SDKs, or frameworks
- Researching solutions to technical problems specific to Kurama's stack

**Key tools**:
- `mcp_exa_web_search_exa`: General web search with content scraping
- `mcp_exa_get_code_context_exa`: Get high-quality code context for programming tasks (use for ANY code-related questions)

**Examples**:
- "TanStack Start file-based routing best practices"
- "Better Auth with Google OAuth integration"
- "Polar SDK payment integration patterns"
- "Drizzle ORM with multiple database adapters"

### Context7 MCP
**Purpose**: Library documentation lookup

**When to use**:
- Need official documentation for a specific library/framework
- Looking for API references, guides, or examples
- Understanding library-specific patterns and conventions

**Key tools**:
- `mcp_context7_resolve_library_id`: Find the correct library ID
- `mcp_context7_get_library_docs`: Fetch documentation for a library

**Examples**:
- Getting TanStack Start/Router documentation
- Looking up Drizzle ORM API reference
- Finding Hono framework guides
- Better Auth configuration and integration patterns
- Tailwind CSS v4 documentation

### Git MCP
**Purpose**: Git operations and repository inspection

**When to use**:
- Checking repository status and changes
- Viewing commit history
- Creating branches
- Inspecting diffs
- Managing staging area

**Key tools**:
- `mcp_git_git_status`: Check working tree status
- `mcp_git_git_diff_unstaged`: View unstaged changes
- `mcp_git_git_diff_staged`: View staged changes
- `mcp_git_git_log`: View commit history
- `mcp_git_git_add`: Stage files
- `mcp_git_git_commit`: Commit changes
- `mcp_git_git_create_branch`: Create new branch
- `mcp_git_git_checkout`: Switch branches

**Examples**:
- Before making changes, check current status
- Review changes before committing
- Create feature branches for new work

### Time MCP
**Purpose**: Timezone conversions and current time

**When to use**:
- Working with timestamps or scheduling
- Converting times between timezones
- Getting current time in specific timezone

**Key tools**:
- `mcp_time_get_current_time`: Get current time in timezone
- `mcp_time_convert_time`: Convert between timezones

### Chrome DevTools MCP
**Purpose**: Browser automation and testing

**When to use**:
- Testing kurama-frontend (user-application) in browser
- Debugging UI issues or authentication flows
- Taking screenshots of components or pages
- Inspecting network requests to kurama-backend
- Analyzing performance of the PWA
- Testing offline functionality and responsive design

**Key tools**:
- `mcp_chrome_devtools_navigate_page`: Navigate to URLs
- `mcp_chrome_devtools_take_snapshot`: Get page structure
- `mcp_chrome_devtools_take_screenshot`: Capture visuals
- `mcp_chrome_devtools_click`: Interact with elements
- `mcp_chrome_devtools_fill`: Fill form inputs
- `mcp_chrome_devtools_list_network_requests`: Inspect API calls
- `mcp_chrome_devtools_list_console_messages`: Check console logs
- `mcp_chrome_devtools_performance_start_trace`: Analyze performance

**Examples**:
- Testing Google OAuth authentication flow
- Verifying Polar payment integration
- Checking responsive design on different devices
- Debugging API calls to kurama-backend
- Testing PWA offline functionality
- Analyzing Core Web Vitals performance

### Shadcn MCP
**Purpose**: shadcn/ui component management

**When to use**:
- Adding new shadcn/ui components to kurama-frontend
- Finding component examples and implementation demos
- Viewing component implementation details and dependencies
- Getting usage patterns for Radix UI primitives
- Checking component compatibility with current setup

**Key tools**:
- `mcp_shadcn_search_items_in_registries`: Search for components
- `mcp_shadcn_view_items_in_registries`: View component details
- `mcp_shadcn_get_item_examples_from_registries`: Get usage examples
- `mcp_shadcn_get_add_command_for_items`: Get CLI command to add components
- `mcp_shadcn_get_audit_checklist`: Verify component setup

**Examples**:
- Adding a new dialog or sheet component for study modes
- Finding examples of form patterns for user registration
- Checking how to implement specific Radix UI components
- Getting the add command for new shadcn components
- Running audit checklist after component setup

## Workflow Integration

### Before Starting Work
1. Use **Git MCP** to check repository status
2. Use **Exa MCP** to research unfamiliar patterns or libraries
3. Use **Context7 MCP** for official documentation

### During Development
1. Use **Shadcn MCP** when adding UI components
2. Use **Exa MCP** for code examples and best practices
3. Use **Git MCP** to track changes incrementally

### Testing & Verification
1. Use **Chrome DevTools MCP** to test kurama-frontend
2. Use **Git MCP** to review diffs before committing
3. Use **Shadcn MCP** audit checklist after adding components
4. Test authentication flows and Polar payment integration
5. Verify PWA functionality and offline capabilities

### When Stuck
1. Use **Exa MCP** to search for solutions
2. Use **Context7 MCP** for library-specific documentation
3. Use **Chrome DevTools MCP** to debug runtime issues

## Best Practices

- **Be proactive**: Don't wait to be asked - use MCP tools when they're relevant
- **Combine tools**: Use multiple MCPs together (e.g., Exa for research + Context7 for docs)
- **Verify work**: Use Chrome DevTools MCP to test changes in kurama-frontend
- **Stay current**: Use Exa MCP to find latest patterns and best practices for TanStack/Hono stack
- **Check before commit**: Use Git MCP to review changes before committing
- **Package awareness**: Remember package names (kurama-frontend, kurama-backend, @kurama/data-ops) when using workspace filtering
- **Build dependencies**: Always build data-ops package before running applications
