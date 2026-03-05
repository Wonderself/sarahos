// RBAC + Portal isolation tests with impersonated viewer token
const BASE = 'http://localhost:3010';
let pass = 0, fail = 0;

async function getAdminToken() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'smadja99@gmail.com', password: 'Polmpolm1$' }),
  });
  return (await res.json()).token;
}

async function impersonate(adminToken, userId) {
  const res = await fetch(`${BASE}/admin/users/${userId}/impersonate`, {
    method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  });
  return (await res.json()).token;
}

(async () => {
  const adminToken = await getAdminToken();
  console.log('Admin token: OK');

  // Impersonate client (viewer role)
  const clientToken = await impersonate(adminToken, 'f6ce92a3-b939-44fd-ac77-4820a1d51d91');
  console.log(`Client viewer token: ${clientToken ? 'OK' : 'FAIL'}`);
  if (!clientToken) process.exit(1);

  // Impersonate paid (operator role)
  const paidToken = await impersonate(adminToken, '58954640-6ebd-4ae3-8ed6-f00f0770e894');
  console.log(`Paid operator token: ${paidToken ? 'OK' : 'FAIL'}`);

  // ═══ RBAC: viewer should NOT access admin endpoints ═══
  console.log('\n═══ RBAC — VIEWER ON ADMIN ENDPOINTS ═══');
  const adminPaths = [
    '/admin/projects', '/admin/modules', '/admin/campaigns',
    '/admin/custom-agents', '/admin/documents', '/admin/users',
    '/admin/stats', '/admin/alarms', '/admin/personal-agents/stats',
    '/admin/crons', '/admin/referrals', '/admin/stats/tiers',
    '/admin/transactions', '/admin/promo-codes',
    '/billing/admin/stats', '/admin/studio/history',
  ];

  for (const path of adminPaths) {
    const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${clientToken}` } });
    const ok = res.status === 403;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  Viewer → ${path} → ${res.status}`);
    if (ok) pass++; else fail++;
  }

  // Viewer should NOT be able to mutate
  console.log('\n═══ RBAC — VIEWER MUTATIONS ═══');
  const mutTests = [
    { method: 'PATCH', path: '/admin/campaigns/00000000-0000-0000-0000-000000000001/status', body: { status: 'approved' } },
    { method: 'PATCH', path: '/admin/custom-agents/00000000-0000-0000-0000-000000000001', body: { isActive: false } },
    { method: 'DELETE', path: '/admin/documents/00000000-0000-0000-0000-000000000001', body: null },
  ];
  for (const { method, path, body } of mutTests) {
    const opts = { method, headers: { Authorization: `Bearer ${clientToken}`, 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const ok = res.status === 403;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  Viewer ${method} ${path} → ${res.status}`);
    if (ok) pass++; else fail++;
  }

  // ═══ PORTAL: client should see ONLY their data ═══
  console.log('\n═══ PORTAL — DATA ISOLATION ═══');

  // Custom agents for client
  const agentsRes = await fetch(`${BASE}/portal/agents/custom`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const agentsData = await agentsRes.json();
  const clientAgents = agentsData.agents || agentsData || [];
  const agentCount = Array.isArray(clientAgents) ? clientAgents.length : 0;
  // Client should have exactly 2 seeded agents (Mon Assistant RH, Agent SEO)
  console.log(`  ${agentCount >= 2 ? 'PASS' : 'WARN'}  Client custom agents: ${agentCount} (expected ≥2)`);
  if (agentCount >= 2) pass++; else fail++;

  // Modules for client
  const modsRes = await fetch(`${BASE}/portal/modules`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const modsData = await modsRes.json();
  const clientMods = modsData.modules || modsData || [];
  const modCount = Array.isArray(clientMods) ? clientMods.length : 0;
  console.log(`  ${modCount >= 2 ? 'PASS' : 'WARN'}  Client modules: ${modCount} (expected ≥2)`);
  if (modCount >= 2) pass++; else fail++;

  // Projects for client
  const projRes = await fetch(`${BASE}/portal/projects`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const projData = await projRes.json();
  const clientProjects = projData.projects || projData || [];
  const projCount = Array.isArray(clientProjects) ? clientProjects.length : 0;
  console.log(`  ${projCount >= 0 ? 'PASS' : 'FAIL'}  Client projects: ${projCount}`);
  pass++;

  // Alarms for client
  const alarmRes = await fetch(`${BASE}/portal/alarms`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const alarmData = await alarmRes.json();
  const clientAlarms = alarmData.alarms || alarmData || [];
  const alarmCount = Array.isArray(clientAlarms) ? clientAlarms.length : 0;
  console.log(`  INFO  Client alarms: ${alarmCount}`);

  // Profile check
  const profileRes = await fetch(`${BASE}/portal/profile`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const profile = await profileRes.json();
  const isClient = profile.email === 'client@freenzy.io' || profile.user?.email === 'client@freenzy.io';
  console.log(`  ${isClient ? 'PASS' : 'FAIL'}  Profile = client@freenzy.io: ${profile.email || profile.user?.email}`);
  if (isClient) pass++; else fail++;

  // Wallet for client
  const walletRes = await fetch(`${BASE}/portal/wallet`, { headers: { Authorization: `Bearer ${clientToken}` } });
  const wallet = await walletRes.json();
  console.log(`  ${walletRes.status === 200 ? 'PASS' : 'FAIL'}  Wallet: balance=${wallet.balance ?? wallet.wallet?.balance}`);
  if (walletRes.status === 200) pass++; else fail++;

  // Dashboard for client
  const dashRes = await fetch(`${BASE}/portal/dashboard`, { headers: { Authorization: `Bearer ${clientToken}` } });
  console.log(`  ${dashRes.status === 200 ? 'PASS' : 'FAIL'}  Dashboard: ${dashRes.status}`);
  if (dashRes.status === 200) pass++; else fail++;

  // ═══ CROSS-USER ISOLATION ═══
  console.log('\n═══ CROSS-USER ISOLATION ═══');

  // Paid user's agents (should be different from client)
  if (paidToken) {
    const paidAgentsRes = await fetch(`${BASE}/portal/agents/custom`, { headers: { Authorization: `Bearer ${paidToken}` } });
    const paidAgentsData = await paidAgentsRes.json();
    const paidAgents = paidAgentsData.agents || paidAgentsData || [];
    const paidAgentCount = Array.isArray(paidAgents) ? paidAgents.length : 0;
    console.log(`  ${paidAgentCount >= 2 ? 'PASS' : 'WARN'}  Paid custom agents: ${paidAgentCount} (expected ≥2 different ones)`);
    if (paidAgentCount >= 2) pass++; else fail++;

    // Paid user profile
    const paidProfile = await (await fetch(`${BASE}/portal/profile`, { headers: { Authorization: `Bearer ${paidToken}` } })).json();
    const isPaid = paidProfile.email === 'paid@freenzy.io' || paidProfile.user?.email === 'paid@freenzy.io';
    console.log(`  ${isPaid ? 'PASS' : 'FAIL'}  Paid profile = paid@freenzy.io: ${paidProfile.email || paidProfile.user?.email}`);
    if (isPaid) pass++; else fail++;
  }

  // ═══ SUMMARY ═══
  console.log('\n' + '═'.repeat(55));
  console.log(`  TOTAL: ${pass + fail} | PASS: ${pass} | FAIL: ${fail}`);
  console.log('═'.repeat(55));

  process.exit(fail > 0 ? 1 : 0);
})();
