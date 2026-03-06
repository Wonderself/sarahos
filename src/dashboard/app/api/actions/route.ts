import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
const DASHBOARD_API_KEY = process.env['DASHBOARD_API_KEY'] ?? 'admin-key-change-me';

let adminToken: string | null = null;
let tokenExpiry = 0;
let tokenPromise: Promise<string> | null = null;

async function getAdminToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && adminToken && Date.now() < tokenExpiry - 60_000) return adminToken;
  // Deduplicate concurrent token fetches
  if (!tokenPromise || forceRefresh) {
    tokenPromise = (async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: DASHBOARD_API_KEY }),
      });
      if (!res.ok) throw new Error('Admin auth failed');
      const data = (await res.json()) as { token: string; expiresIn: string };
      adminToken = data.token;
      tokenExpiry = Date.now() + (parseInt(data.expiresIn) || 24) * 3600_000;
      tokenPromise = null;
      return adminToken;
    })();
  }
  return tokenPromise;
}

function enc(v: unknown): string { return encodeURIComponent(String(v)); }

function callAction(params: Record<string, unknown>, action: unknown, headers: Record<string, string>): Promise<Response> {
  switch (action) {
    case 'createUser':
      return fetch(`${API_BASE}/admin/users`, { method: 'POST', headers, body: JSON.stringify(params) });
    case 'updateUser':
      return fetch(`${API_BASE}/admin/users/${enc(params.id)}`, { method: 'PATCH', headers, body: JSON.stringify(params.data) });
    case 'deleteUser':
      return fetch(`${API_BASE}/admin/users/${enc(params.id)}`, { method: 'DELETE', headers });
    case 'resetUserKey':
      return fetch(`${API_BASE}/admin/users/${enc(params.id)}/reset-key`, { method: 'POST', headers, body: '{}' });
    case 'depositCredits':
      return fetch(`${API_BASE}/billing/deposit`, { method: 'POST', headers, body: JSON.stringify({ userId: params.userId, amount: params.amount, referenceType: 'admin_deposit', description: params.description ?? 'Admin deposit' }) });
    case 'decideApproval':
      return fetch(`${API_BASE}/approvals/${enc(params.id)}/decide`, { method: 'POST', headers, body: JSON.stringify({ decision: params.decision, reason: params.reason }) });
    case 'pauseAgent':
      return fetch(`${API_BASE}/agents/${enc(params.id)}/pause`, { method: 'POST', headers, body: '{}' });
    case 'resumeAgent':
      return fetch(`${API_BASE}/agents/${enc(params.id)}/resume`, { method: 'POST', headers, body: '{}' });
    case 'createPromo':
      return fetch(`${API_BASE}/admin/promo-codes`, { method: 'POST', headers, body: JSON.stringify(params.data) });
    case 'deletePromo':
      return fetch(`${API_BASE}/admin/promo-codes/${enc(params.code)}`, { method: 'DELETE', headers });
    case 'sendNotification':
      return fetch(`${API_BASE}/notifications/send`, { method: 'POST', headers, body: JSON.stringify(params.data) });
    default:
      return Promise.reject(new Error('Unknown action'));
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { action, ...params } = body;

  try {
    let token = await getAdminToken();
    const makeHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
    let res: Response;

    try {
      res = await callAction(params, action, makeHeaders());
    } catch (e) {
      if (e instanceof Error && e.message === 'Unknown action') {
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }
      throw e;
    }

    // Retry once on 401 (expired token)
    if (res.status === 401) {
      token = await getAdminToken(true);
      res = await callAction(params, action, makeHeaders());
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
