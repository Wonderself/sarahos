import { NextRequest, NextResponse } from 'next/server';
import { verifyCallerAuth } from '@/lib/api-auth';
import { getProfileConfig, type DashboardProfileConfig } from '@/lib/profile-config-loader';

// ─── GET /api/dashboard/config ──────────────────────────────
// Returns the merged dashboard configuration for the authenticated user.
// Query params: profession (required), orgId (optional)
export async function GET(req: NextRequest) {
  // Auth check
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  const { searchParams } = new URL(req.url);
  const profession = searchParams.get('profession') ?? 'default';
  const orgId = searchParams.get('orgId') ?? undefined;

  // TODO: Load user/org configs from database
  // const userConfig = await loadUserDashboardConfig(auth.userId);
  // const orgConfig = orgId ? await loadOrgDashboardConfig(orgId) : undefined;
  void orgId;

  const userConfig: Partial<DashboardProfileConfig> | undefined = undefined;
  const orgConfig: Partial<DashboardProfileConfig> | undefined = undefined;

  const config = getProfileConfig(profession, userConfig, orgConfig);

  return NextResponse.json(config);
}

// ─── PUT /api/dashboard/config ──────────────────────────────
// Updates the user's dashboard_config.
// Body: { reset: true } to reset, or partial DashboardProfileConfig to merge.
export async function PUT(req: NextRequest) {
  // Auth check
  const auth = await verifyCallerAuth(req);
  if (!auth.authenticated) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Reset flow
  if (body['reset'] === true) {
    // TODO: Clear user's dashboard_config in database
    // await db.query('UPDATE users SET dashboard_config = NULL WHERE id = $1', [auth.userId]);
    return NextResponse.json({ success: true, message: 'Dashboard configuration reset' });
  }

  // Validate section updates if provided
  if (body['sections'] && !Array.isArray(body['sections'])) {
    return NextResponse.json({ error: 'sections must be an array' }, { status: 400 });
  }

  // TODO: Persist to database
  // const partialConfig: Partial<DashboardProfileConfig> = {
  //   greeting: body.greeting as string | undefined,
  //   subtitle: body.subtitle as string | undefined,
  //   accentColor: body.accentColor as string | undefined,
  //   sections: body.sections as DashboardSectionConfig[] | undefined,
  // };
  // await db.query('UPDATE users SET dashboard_config = $1 WHERE id = $2', [partialConfig, auth.userId]);

  return NextResponse.json({
    success: true,
    message: 'Dashboard configuration updated',
    userId: auth.userId,
  });
}
