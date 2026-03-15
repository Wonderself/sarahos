Show the complete status of the Freenzy.io project.

## Check and report:
1. **Git**: current branch, uncommitted changes, unpushed commits, last 5 commits
2. **Dependencies**: run `npm outdated` for backend and dashboard
3. **Docker**: check if containers are running (`docker ps` if available)
4. **Database**: check connection status if possible
5. **Tests**: quick `npm test -- --ci` summary
6. **Build**: verify `npx tsc --noEmit` passes
7. **Disk**: check project size and node_modules size
8. **Crons**: list active cron scripts in scripts/cron/

## Format:
Use a clean summary with ✅/❌/⚠️ status indicators for each check.
