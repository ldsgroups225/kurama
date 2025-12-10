---
name: Security Scan
description: Scan for security issues when sensitive files are saved
trigger: onFileSave
pattern: "**/*.{ts,tsx,env,json}"
action: agent
---

When files are saved, scan for potential security issues:

1. Check for hardcoded secrets:
   - API keys (patterns like `sk_`, `pk_`, `api_key`)
   - Passwords or tokens in code
   - Database connection strings
   - OAuth client secrets

2. Check for sensitive data exposure:
   - Console.log statements with user data
   - Error messages exposing internal details
   - Unfiltered database queries

3. Check for common vulnerabilities:
   - SQL injection (raw queries without parameterization)
   - XSS (dangerouslySetInnerHTML without sanitization)
   - Missing input validation
   - Insecure redirects

4. For `.env` files:
   - Ensure they're in `.gitignore`
   - Check for production secrets in development files

5. If issues found:
   - Report the specific line and issue
   - Suggest secure alternatives
   - Link to relevant security documentation

6. Skip false positives:
   - Test files with mock data
   - Documentation examples
   - Type definitions
