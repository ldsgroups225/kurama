# MCP (Model Context Protocol) Usage Guidelines

This project has several MCP servers configured. Use them proactively in your workflow.

## Available MCP Servers

### Exa MCP
**Purpose**: Web search and code context retrieval

**When to use**:
- Searching for latest documentation, examples, or best practices
- Finding real-world usage patterns for libraries/frameworks
- Getting fresh context about APIs, SDKs, or frameworks
- Researching solutions to technical problems

**Key tools**:
- `mcp_exa_web_search_exa`: General web search with content scraping
- `mcp_exa_get_code_context_exa`: Get high-quality code context for programming tasks (use for ANY code-related questions)

**Examples**:
- "How to implement Durable Objects with Hono"
- "TanStack Start server functions best practices"
- "Better Auth with Polar integration examples"

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
- Getting TanStack Router documentation
- Looking up Drizzle ORM API reference
- Finding Hono framework guides

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
- Testing the user-application in browser
- Debugging UI issues
- Taking screenshots of components
- Inspecting network requests
- Analyzing performance
- Interacting with the application

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
- Testing authentication flow
- Verifying Polar payment integration
- Checking responsive design
- Debugging API calls to data-service

### Shadcn MCP
**Purpose**: shadcn/ui component management

**When to use**:
- Adding new UI components
- Finding component examples and demos
- Viewing component implementation details
- Getting usage patterns for components

**Key tools**:
- `mcp_shadcn_search_items_in_registries`: Search for components
- `mcp_shadcn_view_items_in_registries`: View component details
- `mcp_shadcn_get_item_examples_from_registries`: Get usage examples
- `mcp_shadcn_get_add_command_for_items`: Get CLI command to add components
- `mcp_shadcn_get_audit_checklist`: Verify component setup

**Examples**:
- Adding a new dialog component
- Finding examples of form patterns
- Checking how to use a specific Radix UI component

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
1. Use **Chrome DevTools MCP** to test user-application
2. Use **Git MCP** to review diffs before committing
3. Use **Shadcn MCP** audit checklist after adding components

### When Stuck
1. Use **Exa MCP** to search for solutions
2. Use **Context7 MCP** for library-specific documentation
3. Use **Chrome DevTools MCP** to debug runtime issues

## Best Practices

- **Be proactive**: Don't wait to be asked - use MCP tools when they're relevant
- **Combine tools**: Use multiple MCPs together (e.g., Exa for research + Context7 for docs)
- **Verify work**: Use Chrome DevTools MCP to test changes in user-application
- **Stay current**: Use Exa MCP to find latest patterns and best practices
- **Check before commit**: Use Git MCP to review changes before committing
