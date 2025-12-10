---
name: README Update
description: Update documentation when significant changes are made
trigger: manual
---

When triggered, review recent changes and update relevant documentation:

1. **Check recent git commits** for significant changes:
   ```bash
   git log --oneline -10
   ```
   Look for:
   - New features added
   - Breaking changes
   - New dependencies
   - Configuration changes
   - API modifications

2. **Update relevant documentation**:
   - `README.md` for major features and setup changes
   - `CLAUDE.md` for development guidance updates
   - Steering files for new patterns or conventions
   - Package-specific READMEs in apps/packages

3. **Ensure documentation includes**:
   - Updated setup instructions
   - New command examples with correct syntax
   - Changed configuration steps
   - Migration steps for breaking changes
   - New environment variables

4. **Verify documentation accuracy**:
   - Test all commands work as documented
   - Check file paths are correct
   - Verify examples are up to date
   - Ensure links work properly

5. **Update specific sections**:
   - **Tech Stack**: New dependencies or version updates
   - **Commands**: New scripts or changed syntax
   - **Architecture**: Structural changes
   - **Deployment**: New deployment steps
   - **Environment**: New variables or configuration

6. **Format documentation consistently**:
   - Clear headings hierarchy
   - Code blocks with proper syntax highlighting
   - Consistent style and tone
   - Proper markdown formatting

7. **Check for completeness**:
   - All new features documented
   - Breaking changes clearly marked
   - Migration paths provided
   - Troubleshooting sections updated
