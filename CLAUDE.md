# CLAUDE.md - Kurama AI Development Guide

This guide outlines the AI-assisted development workflow for the Kurama project.

## 1. Core Project Commands

```bash
pnpm run setup            # First-time setup (install deps, build packages)
pnpm dev:kurama-frontend  # Run frontend dev server
pnpm dev:kurama-backend   # Run backend dev server
pnpm dev:kurama-admin     # Run admin dev server
pnpm run test             # Run all tests
```

## 2. Project Conventions and Architecture

For detailed guidance on technology, code conventions, and architecture, please refer to the documents in the `.kiro/steering/` directory. An AI agent should review these files to understand project standards.

## 3. AI Development Workflows

### For Features (`feat`) or Bug Fixes (`bug`)

Follow this structured, three-phase process.

#### A. Define the Work (PRD & Task Generation)

1. **Create a PRD:** Use `agent-template/create-prd.md` to define the feature or bug fix.

    ```text

    Use @agent-template/create-prd.md

    Feature: [Describe your feature or the bug to be fixed in detail]

    ```

2. **Generate Tasks:** Use the new PRD and `agent-template/generate-tasks.md` to create a step-by-step plan.

    ```text

    Use @<your-prd-file>.md and @agent-template/generate-tasks.md to create the task list.

    ```

#### B. Implement the Tasks

- Instruct your AI assistant to implement the work, one sub-task at a time.

#### C. Verify and Finalize with the Orchestrator

- After implementation, run the automated script to format, test, and prepare your changes for commit.

    ```bash
    ./git_workflow_orchestrator.py feat  # Or `./git_workflow_orchestrator.py bug`
    ```

### For Code Reviews (`review`)

- To perform a read-only check of the current code, run the `review` agent. It will report type, lint, and test errors without making changes.

    ```bash
    ./git_workflow_orchestrator.py review
    ```

## 4. Automated Workflow Configuration

*The block below is parsed by `git_workflow_orchestrator.py` and should not be modified unless you are changing the core workflow steps.*

<!--AGENT_WORKFLOWS_START-->
```yaml
agents:
  - name: review
    description: "Read-only workflow for code reviews. Runs checks without making changes."
    steps:
      - name: "Git Status Check"
        function: "check_git_status"
      - name: "Type Checking (Read-only)"
        function: "run_typecheck_readonly"
      - name: "Linting (Read-only)"
        function: "run_lint_readonly"
      - name: "Testing (Read-only)"
        function: "run_tests_readonly"

  - name: feat
    description: "Full workflow for new features. Fixes issues and suggests a commit."
    steps:
      - name: "Git Status Check"
        function: "check_git_status"
      - name: "Type Checking"
        function: "run_typecheck_fix"
      - name: "Linting (with Fixes)"
        function: "run_lint_fix"
      - name: "Testing (with Retries)"
        function: "run_tests_with_retry"
      - name: "Final Status Check"
        function: "check_final_status"
      - name: "Suggest Commit Message"
        function: "suggest_commit_message"

  - name: bug
    alias: fix
    description: "Full workflow for bug fixes. Fixes issues and suggests a commit."
    steps:
      - name: "Git Status Check"
        function: "check_git_status"
      - name: "Type Checking"
        function: "run_typecheck_fix"
      - name: "Linting (with Fixes)"
        function: "run_lint_fix"
      - name: "Testing (with Retries)"
        function: "run_tests_with_retry"
      - name: "Final Status Check"
        function: "check_final_status"
      - name: "Suggest Commit Message"
        function: "suggest_commit_message"
```
<!--AGENT_WORKFLOWS_END-->
