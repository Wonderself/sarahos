import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
const DASHBOARD_API_KEY = process.env['DASHBOARD_API_KEY'] ?? 'admin-key-change-me';

let adminToken: string | null = null;
let tokenExpiry = 0;

async function getAdminToken(): Promise<string> {
  if (adminToken && Date.now() < tokenExpiry - 60_000) return adminToken;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: DASHBOARD_API_KEY }),
  });
  if (!res.ok) throw new Error('Admin auth failed');
  const data = (await res.json()) as { token: string; expiresIn: string };
  adminToken = data.token;
  tokenExpiry = Date.now() + (parseInt(data.expiresIn) || 24) * 3600_000;
  return adminToken;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, ...params } = body;

  try {
    const token = await getAdminToken();
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    let res: Response;

    switch (action) {
      case 'createUser':
        res = await fetch(`${API_BASE}/admin/users`, { method: 'POST', headers, body: JSON.stringify(params) });
        break;
      case 'updateUser':
        res = await fetch(`${API_BASE}/admin/users/${params.id}`, { method: 'PATCH', headers, body: JSON.stringify(params.data) });
        break;
      case 'deleteUser':
        res = await fetch(`${API_BASE}/admin/users/${params.id}`, { method: 'DELETE', headers });
        break;
      case 'resetUserKey':
        res = await fetch(`${API_BASE}/admin/users/${params.id}/reset-key`, { method: 'POST', headers, body: '{}' });
        break;
      case 'depositCredits':
        res = await fetch(`${API_BASE}/billing/deposit`, { method: 'POST', headers, body: JSON.stringify({ userId: params.userId, amount: params.amount, referenceType: 'admin_deposit', description: params.description ?? 'Admin deposit' }) });
        break;
      case 'decideApproval':
        res = await fetch(`${API_BASE}/approvals/${params.id}/decide`, { method: 'POST', headers, body: JSON.stringify({ decision: params.decision, reason: params.reason }) });
        break;
      case 'pauseAgent':
        res = await fetch(`${API_BASE}/agents/${params.id}/pause`, { method: 'POST', headers, body: '{}' });
        break;
      case 'resumeAgent':
        res = await fetch(`${API_BASE}/agents/${params.id}/resume`, { method: 'POST', headers, body: '{}' });
        break;
      case 'createPromo':
        res = await fetch(`${API_BASE}/admin/promo-codes`, { method: 'POST', headers, body: JSON.stringify(params.data) });
        break;
      case 'deletePromo':
        res = await fetch(`${API_BASE}/admin/promo-codes/${params.code}`, { method: 'DELETE', headers });
        break;
      case 'sendNotification':
        res = await fetch(`${API_BASE}/notifications/send`, { method: 'POST', headers, body: JSON.stringify(params.data) });
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
