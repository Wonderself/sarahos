Deploy the Freenzy.io project to production via Coolify.

## Checklist before deploy:
1. Run `npx tsc --noEmit --project src/dashboard/tsconfig.json` — must pass (pre-existing .next/types errors are OK)
2. Run `npm run lint` — must pass
3. Run `npm test` — must pass
4. Run `npx next build` in src/dashboard/ — must produce 0 new errors
5. Check `git status` — no uncommitted changes
6. Check current branch — must be `main` or a release branch

## Deploy steps:
1. Push to main: `git push origin main`
2. Coolify auto-deploys from main
3. If manual deploy needed: clear cache and redeploy in Coolify dashboard
4. Verify health: check https://freenzy.io and API endpoints

## Post-deploy:
- Monitor logs for errors
- Test critical flows (login, dashboard, agent calls)
- Check credit system is deducting correctly
