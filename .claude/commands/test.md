Run the complete test suite for Freenzy.io and provide a detailed report.

## Steps:
1. Run `npm test -- --ci --coverage` for backend tests
2. Run `npx tsc --noEmit --project src/dashboard/tsconfig.json` for TypeScript validation
3. Run `npm run lint` for code quality

## Report format:
- Total test suites: X passed, Y failed
- Total tests: X passed, Y failed
- Coverage summary (lines, functions, branches, statements)
- List any failing tests with error details
- List any new TypeScript errors (ignore pre-existing .next/types errors)
- List any lint warnings/errors

## If tests fail:
- Analyze the failure
- Propose a fix
- Do NOT auto-fix without user confirmation
