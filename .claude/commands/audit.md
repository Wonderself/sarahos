Perform a security and quality audit on the Freenzy.io codebase.

## Security checks:
1. Search for hardcoded secrets, API keys, tokens in source files (not .env)
2. Check for console.log in production code (should use structured logger)
3. Verify JWT auth is properly implemented
4. Check Twilio webhook HMAC validation is in place
5. Verify PII masking in logs (RGPD compliance)
6. Check for SQL injection risks (parameterized queries)
7. Check for XSS risks in frontend components
8. Verify CORS configuration
9. Check that all localStorage keys use `fz_` prefix

## Quality checks:
1. Find any `any` types in TypeScript (should be 0)
2. Check for unused imports and dead code
3. Verify agent IDs use `fz-*` prefix (never `sarah-*`)
4. Check credit system: deduct BEFORE action, reimburse on API error
5. Verify database migrations are up to date

## Output:
- Severity levels: CRITICAL, WARNING, INFO
- File path and line number for each finding
- Suggested fix for each issue
