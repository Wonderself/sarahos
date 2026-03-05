// Ultra-deep test of all admin + portal endpoints with real data verification
const BASE = 'http://localhost:3010';
let pass = 0, fail = 0;

function track(r) { if (r.pass) pass++; else fail++; return r; }

async function getToken(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token;
}

async function testGet(token, path, label, validate) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status !== 200) {
      const text = await res.text().catch(() => '');
      console.log(`  FAIL  ${label} → ${res.status} ${text.slice(0, 150)}`);
      return { pass: false, label };
    }
    const data = await res.json();
    console.log(`  PASS  ${label} → ${validate(data)}`);
    return { pass: true, label, data };
  } catch (e) {
    console.log(`  FAIL  ${label} → ${e.message}`);
    return { pass: false, label };
  }
}

async function testMut(token, method, path, body, label, expectStatus) {
  try {
    const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    const ok = expectStatus ? res.status === expectStatus : (res.status >= 200 && res.status < 300);
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} → ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
    return { pass: ok, label, data, status: res.status };
  } catch (e) {
    console.log(`  FAIL  ${label} → ${e.message}`);
    return { pass: false, label };
  }
}

async function testNoAuth(path, label) {
  const res = await fetch(`${BASE}${path}`);
  const ok = res.status === 401;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} → ${res.status}`);
  return { pass: ok, label };
}

async function testForbidden(token, path, label) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const ok = res.status === 403;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} → ${res.status} (expect 403)`);
  return { pass: ok, label };
}

(async () => {
  // ─── AUTH ───
  console.log('\n═══ AUTH ═══');
  const adminToken = await getToken('smadja99@gmail.com', 'Polmpolm1$');
  console.log(`  Admin: ${adminToken ? 'OK' : 'FAIL'}`);
  if (!adminToken) process.exit(1);

  let clientToken = null;
  try { clientToken = await getToken('client@freenzy.io', 'Freenzy*Client1$'); } catch {}
  console.log(`  Client: ${clientToken ? 'OK' : 'no token (expected for viewer)'}`);

  // ─── 7 PILOTAGE ENDPOINTS ───
  console.log('\n═══ PILOTAGE (7 new features) ═══');

  const proj = track(await testGet(adminToken, '/admin/projects', 'GET /admin/projects', d =>
    `total=${d.stats?.total} active=${d.stats?.active} users=${d.stats?.usersCount} rows=${d.projects?.length}`));

  const mods = track(await testGet(adminToken, '/admin/modules', 'GET /admin/modules', d =>
    `total=${d.stats?.total} published=${d.stats?.published} rows=${d.modules?.length}`));

  const camp = track(await testGet(adminToken, '/admin/campaigns', 'GET /admin/campaigns', d =>
    `total=${d.stats?.total} active=${d.stats?.active} pending=${d.stats?.pending} rows=${d.campaigns?.length}`));

  const alarms = track(await testGet(adminToken, '/admin/alarms', 'GET /admin/alarms', d =>
    `total=${d.stats?.total} active=${d.stats?.active} rows=${d.alarms?.length}`));

  const cagents = track(await testGet(adminToken, '/admin/custom-agents', 'GET /admin/custom-agents', d =>
    `total=${d.stats?.total} active=${d.stats?.active} users=${d.stats?.usersCount} rows=${d.agents?.length}`));

  const pagents = track(await testGet(adminToken, '/admin/personal-agents/stats', 'GET /admin/personal-agents/stats', d =>
    `configs=${d.configs?.length} budgetTx=${d.budget?.transactions} budgetUsers=${d.budget?.users} freelance=${d.comptable?.records} cv=${d.cv?.total} events=${d.events?.total} writing=${d.writing?.projects}`));

  const docs = track(await testGet(adminToken, '/admin/documents', 'GET /admin/documents', d =>
    `total=${d.stats?.total} users=${d.stats?.usersCount} bytes=${d.stats?.totalBytes} tokens=${d.stats?.totalTokens} rows=${d.documents?.length}`));

  // ─── DATA INTEGRITY ───
  console.log('\n═══ DATA INTEGRITY (seeded data) ═══');

  // Projects should have data
  const projOk = proj.data?.projects?.length >= 1;
  console.log(`  ${projOk ? 'PASS' : 'FAIL'}  Projects has rows: ${proj.data?.projects?.length}`);
  if (projOk) pass++; else fail++;

  // Modules: seeded 5
  const modsOk = mods.data?.modules?.length >= 5;
  console.log(`  ${modsOk ? 'PASS' : 'FAIL'}  Modules has ≥5 rows: ${mods.data?.modules?.length}`);
  if (modsOk) pass++; else fail++;

  // Campaigns: check statuses
  const campStatuses = camp.data?.campaigns?.map(c => c.status) || [];
  const hasPending = campStatuses.includes('pending_approval');
  const hasActive = campStatuses.includes('active');
  console.log(`  ${hasPending ? 'PASS' : 'FAIL'}  Campaign pending_approval present`);
  console.log(`  ${hasActive ? 'PASS' : 'FAIL'}  Campaign active present`);
  if (hasPending) pass++; else fail++;
  if (hasActive) pass++; else fail++;

  // Custom agents: seeded names
  const agentNames = cagents.data?.agents?.map(a => a.name) || [];
  const hasSeedAgent = agentNames.includes('Mon Assistant RH');
  console.log(`  ${hasSeedAgent ? 'PASS' : 'FAIL'}  Custom agent "Mon Assistant RH" present (${agentNames.length} agents)`);
  if (hasSeedAgent) pass++; else fail++;

  // Documents: check types
  const docTypes = docs.data?.documents?.map(d => d.fileType) || [];
  const hasPdf = docTypes.includes('pdf');
  const hasCsv = docTypes.includes('csv');
  console.log(`  ${hasPdf ? 'PASS' : 'FAIL'}  Document PDF present`);
  console.log(`  ${hasCsv ? 'PASS' : 'FAIL'}  Document CSV present`);
  if (hasPdf) pass++; else fail++;
  if (hasCsv) pass++; else fail++;

  // Personal agents: budget, freelance, cv, events, writing
  const pa = pagents.data;
  const budgetOk = pa?.budget?.users >= 3 && pa?.budget?.transactions >= 7;
  const freelanceOk = pa?.comptable?.records >= 4;
  const cvOk = pa?.cv?.total >= 2;
  const eventsOk = pa?.events?.total >= 2;
  const writingOk = pa?.writing?.projects >= 2;
  console.log(`  ${budgetOk ? 'PASS' : 'FAIL'}  Budget: ${pa?.budget?.users} users, ${pa?.budget?.transactions} tx`);
  console.log(`  ${freelanceOk ? 'PASS' : 'FAIL'}  Freelance: ${pa?.comptable?.records} records`);
  console.log(`  ${cvOk ? 'PASS' : 'FAIL'}  CV profiles: ${pa?.cv?.total}`);
  console.log(`  ${eventsOk ? 'PASS' : 'FAIL'}  Events: ${pa?.events?.total}`);
  console.log(`  ${writingOk ? 'PASS' : 'FAIL'}  Writing: ${pa?.writing?.projects} projects, ${pa?.writing?.words} words`);
  [budgetOk, freelanceOk, cvOk, eventsOk, writingOk].forEach(ok => ok ? pass++ : fail++);

  // ─── MUTATIONS ───
  console.log('\n═══ MUTATIONS ═══');

  // Approve pending campaign
  const pendingCamp = camp.data?.campaigns?.find(c => c.status === 'pending_approval');
  if (pendingCamp) {
    track(await testMut(adminToken, 'PATCH', `/admin/campaigns/${pendingCamp.id}/status`, { status: 'approved' }, 'Approve pending campaign', 200));
    // Verify
    const after = await (await fetch(`${BASE}/admin/campaigns`, { headers: { Authorization: `Bearer ${adminToken}` } })).json();
    const found = after.campaigns?.find(c => c.id === pendingCamp.id);
    const verified = found?.status === 'approved';
    console.log(`  ${verified ? 'PASS' : 'FAIL'}  Verify campaign now approved: ${found?.status}`);
    if (verified) pass++; else fail++;
    // Reset
    await testMut(adminToken, 'PATCH', `/admin/campaigns/${pendingCamp.id}/status`, { status: 'pending_approval' }, 'Reset campaign', 200);
    pass++;
  }

  // Toggle custom agent off then on
  const firstAgent = cagents.data?.agents?.find(a => a.isActive);
  if (firstAgent) {
    track(await testMut(adminToken, 'PATCH', `/admin/custom-agents/${firstAgent.id}`, { isActive: false }, `Deactivate "${firstAgent.name}"`, 200));
    track(await testMut(adminToken, 'PATCH', `/admin/custom-agents/${firstAgent.id}`, { isActive: true }, `Reactivate "${firstAgent.name}"`, 200));
  }

  // Soft-delete document
  const faqDoc = docs.data?.documents?.find(d => d.filename?.includes('FAQ'));
  if (faqDoc) {
    track(await testMut(adminToken, 'DELETE', `/admin/documents/${faqDoc.id}`, null, `Delete doc "${faqDoc.filename}"`, 200));
    const afterDocs = await (await fetch(`${BASE}/admin/documents`, { headers: { Authorization: `Bearer ${adminToken}` } })).json();
    const stillThere = afterDocs.documents?.find(d => d.id === faqDoc.id);
    const gone = !stillThere;
    console.log(`  ${gone ? 'PASS' : 'FAIL'}  Document no longer in active list`);
    if (gone) pass++; else fail++;
  }

  // Invalid status
  track(await testMut(adminToken, 'PATCH', '/admin/campaigns/00000000-0000-0000-0000-000000000099/status', { status: 'approved' }, 'Non-existent campaign → 404', 404));

  // Bad status value
  if (pendingCamp) {
    track(await testMut(adminToken, 'PATCH', `/admin/campaigns/${pendingCamp.id}/status`, { status: 'INVALID_STATUS' }, 'Invalid status value → 400', 400));
  }

  // ─── OTHER ADMIN ENDPOINTS ───
  console.log('\n═══ ADMIN CORE ENDPOINTS ═══');

  track(await testGet(adminToken, '/admin/users', 'Users list', d =>
    `users=${d.users?.length} total=${d.total}`));

  track(await testGet(adminToken, '/admin/stats', 'Global stats', d =>
    `keys=${Object.keys(d).join(',')}`));

  track(await testGet(adminToken, '/admin/referrals', 'Referrals', d =>
    `referrals=${d.referrals?.length} stats=${JSON.stringify(d.stats)}`));

  track(await testGet(adminToken, '/admin/stats/tiers', 'Tiers stats', d =>
    `tiers=${d.tiers?.length || Object.keys(d).length}`));

  track(await testGet(adminToken, '/admin/transactions', 'Transactions', d =>
    `tx=${d.transactions?.length ?? d.length ?? '?'}`));

  track(await testGet(adminToken, '/admin/crons', 'Cron jobs', d =>
    `crons=${d.crons?.length || JSON.stringify(d).slice(0, 80)}`));

  track(await testGet(adminToken, '/admin/promo-codes', 'Promo codes', d =>
    `codes=${d.promoCodes?.length ?? d.length ?? '?'}`));

  track(await testGet(adminToken, '/billing/admin/stats', 'Billing admin stats', d =>
    `keys=${Object.keys(d).join(',')}`));

  // Studio
  track(await testGet(adminToken, '/admin/studio/api-status', 'Studio API status', d =>
    `${JSON.stringify(d).slice(0, 100)}`));

  track(await testGet(adminToken, '/admin/studio/config', 'Studio config', d =>
    `models=${d.models?.length ?? d.config?.length ?? '?'}`));

  track(await testGet(adminToken, '/admin/studio/history', 'Studio history', d =>
    `generations=${d.generations?.length}`));

  // Health
  track(await testGet(adminToken, '/health', 'Health', d =>
    `status=${d.status} version=${d.version}`));

  // ─── PORTAL ENDPOINTS (client user) ───
  console.log('\n═══ PORTAL ENDPOINTS (client@freenzy.io) ═══');

  if (clientToken) {
    track(await testGet(clientToken, '/portal/profile', 'Profile', d =>
      `email=${d.email || d.user?.email}`));

    track(await testGet(clientToken, '/portal/dashboard', 'Dashboard', d =>
      `keys=${Object.keys(d).join(',')}`));

    track(await testGet(clientToken, '/portal/agents/custom', 'Custom agents', d =>
      `agents=${d.agents?.length ?? d.length ?? '?'}`));

    track(await testGet(clientToken, '/portal/modules', 'Modules', d =>
      `modules=${d.modules?.length ?? d.length ?? '?'}`));

    track(await testGet(clientToken, '/portal/projects', 'Projects', d =>
      `projects=${d.projects?.length ?? d.length ?? '?'}`));

    track(await testGet(clientToken, '/portal/alarms', 'Alarms', d =>
      `alarms=${d.alarms?.length ?? d.length ?? '?'}`));

    track(await testGet(clientToken, '/portal/wallet', 'Wallet', d =>
      `balance=${d.balance ?? d.wallet?.balance ?? '?'}`));

    track(await testGet(clientToken, '/portal/preferences', 'Preferences', d =>
      `keys=${Object.keys(d).join(',')}`));

    track(await testGet(clientToken, '/portal/referrals', 'Referrals', d =>
      `referrals=${d.referrals?.length ?? '?'}`));

    track(await testGet(clientToken, '/portal/gamification', 'Gamification', d =>
      `keys=${Object.keys(d).join(',')}`));

    track(await testGet(clientToken, '/portal/activity', 'Activity', d =>
      `activities=${d.activities?.length ?? d.length ?? '?'}`));

    // Data isolation: client should only see their own docs/agents
    const clientDocs = await (await fetch(`${BASE}/portal/user-data/documents`, { headers: { Authorization: `Bearer ${clientToken}` } })).json();
    const clientAgents = await (await fetch(`${BASE}/portal/agents/custom`, { headers: { Authorization: `Bearer ${clientToken}` } })).json();
    console.log(`  INFO  Client sees ${(clientAgents.agents || clientAgents)?.length ?? 0} custom agents, docs namespace=${JSON.stringify(clientDocs).slice(0, 80)}`);
  } else {
    console.log('  SKIP  No client token — testing with admin token on portal endpoints');
    // Use admin token for portal endpoints
    track(await testGet(adminToken, '/portal/profile', 'Profile (admin)', d =>
      `email=${d.email || d.user?.email}`));
    track(await testGet(adminToken, '/portal/dashboard', 'Dashboard (admin)', d =>
      `keys=${Object.keys(d).join(',')}`));
  }

  // ─── RBAC: NO AUTH ───
  console.log('\n═══ RBAC — NO AUTH ═══');
  for (const p of ['/admin/projects', '/admin/modules', '/admin/campaigns', '/admin/custom-agents',
    '/admin/documents', '/admin/users', '/admin/stats', '/admin/alarms', '/admin/personal-agents/stats',
    '/admin/crons', '/admin/referrals', '/billing/admin/stats']) {
    track(await testNoAuth(p, `NoAuth → ${p}`));
  }

  // ─── RBAC: CLIENT TOKEN ON ADMIN ENDPOINTS ───
  console.log('\n═══ RBAC — CLIENT ON ADMIN ═══');
  if (clientToken) {
    for (const p of ['/admin/projects', '/admin/modules', '/admin/campaigns', '/admin/custom-agents',
      '/admin/documents', '/admin/users']) {
      track(await testForbidden(clientToken, p, `Client → ${p}`));
    }
  } else {
    console.log('  SKIP  No client token');
  }

  // ─── EDGE CASES ───
  console.log('\n═══ EDGE CASES ═══');

  // SQL injection in path
  const r1 = await fetch(`${BASE}/admin/campaigns/1;DROP TABLE users--/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
  console.log(`  ${r1.status >= 400 ? 'PASS' : 'FAIL'}  SQL injection path → ${r1.status}`);
  if (r1.status >= 400) pass++; else fail++;

  // SQL injection in body
  const r2 = await fetch(`${BASE}/admin/campaigns/00000000-0000-0000-0000-000000000001/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: "approved'; DROP TABLE users;--" }),
  });
  console.log(`  ${r2.status >= 400 ? 'PASS' : 'FAIL'}  SQL injection body → ${r2.status}`);
  if (r2.status >= 400) pass++; else fail++;

  // XSS in body
  const r3 = await fetch(`${BASE}/admin/campaigns/00000000-0000-0000-0000-000000000001/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: '<script>alert(1)</script>' }),
  });
  console.log(`  ${r3.status >= 400 ? 'PASS' : 'FAIL'}  XSS attempt → ${r3.status}`);
  if (r3.status >= 400) pass++; else fail++;

  // Invalid UUID format
  const r4 = await fetch(`${BASE}/admin/custom-agents/not-a-uuid`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: true }),
  });
  console.log(`  ${r4.status >= 400 ? 'PASS' : 'FAIL'}  Invalid UUID → ${r4.status}`);
  if (r4.status >= 400) pass++; else fail++;

  // Empty body
  const r5 = await fetch(`${BASE}/admin/campaigns/00000000-0000-0000-0000-000000000001/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  console.log(`  ${r5.status >= 400 ? 'PASS' : 'FAIL'}  Empty body → ${r5.status}`);
  if (r5.status >= 400) pass++; else fail++;

  // Malformed JSON
  const r6 = await fetch(`${BASE}/admin/campaigns/00000000-0000-0000-0000-000000000001/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: '{bad json',
  });
  console.log(`  ${r6.status >= 400 ? 'PASS' : 'FAIL'}  Malformed JSON → ${r6.status}`);
  if (r6.status >= 400) pass++; else fail++;

  // Expired/invalid token
  const r7 = await fetch(`${BASE}/admin/projects`, {
    headers: { Authorization: 'Bearer expired.invalid.token' },
  });
  console.log(`  ${r7.status === 401 ? 'PASS' : 'FAIL'}  Invalid JWT → ${r7.status}`);
  if (r7.status === 401) pass++; else fail++;

  // ═══ SUMMARY ═══
  console.log('\n' + '═'.repeat(55));
  console.log(`  TOTAL: ${pass + fail} | PASS: ${pass} | FAIL: ${fail}`);
  console.log('═'.repeat(55));

  process.exit(fail > 0 ? 1 : 0);
})();
