const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
const DASHBOARD_API_KEY = process.env['DASHBOARD_API_KEY'] ?? '';

if (typeof process !== 'undefined' && !DASHBOARD_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('[SECURITY] DASHBOARD_API_KEY is not set — API calls will fail!');
}

// ── JWT Token Cache (server-side, survives across SSR requests) ──
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60_000) {
    return cachedToken;
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: DASHBOARD_API_KEY }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Dashboard auth failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { token: string; expiresIn: string };
  cachedToken = data.token;
  const hours = parseInt(data.expiresIn) || 24;
  tokenExpiresAt = Date.now() + hours * 3600_000;
  return cachedToken;
}

const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  });

  if (response.status === 401) {
    cachedToken = null;
    tokenExpiresAt = 0;
    const newToken = await getAuthToken();
    const retry = await fetchWithTimeout(`${API_BASE}${path}`, {
      cache: 'no-store',
      ...options,
      headers: { Authorization: `Bearer ${newToken}`, ...options?.headers },
    });
    if (!retry.ok) throw new Error(`API error: ${retry.status} ${retry.statusText}`);
    return retry.json() as Promise<T>;
  }

  // Retry once on 5xx errors
  if (response.status >= 500) {
    const retry = await fetchWithTimeout(`${API_BASE}${path}`, {
      cache: 'no-store',
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options?.headers },
    });
    if (!retry.ok) throw new Error(`API error: ${retry.status} ${retry.statusText}`);
    return retry.json() as Promise<T>;
  }

  if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

async function postAPI<T>(path: string, body: unknown): Promise<T> {
  return fetchAPI<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patchAPI<T>(path: string, body: unknown): Promise<T> {
  return fetchAPI<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function deleteAPI<T>(path: string): Promise<T> {
  return fetchAPI<T>(path, { method: 'DELETE' });
}

async function fetchPublic<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

// ── Types ──

export interface HealthResponse {
  status: string;
  version: string;
  phase: number;
  agents: { total: number; entries: Array<{ name: string; level: number; status: string }> };
  avatarPipeline: Record<string, unknown>;
  uptime: number;
}

export interface AgentEntry {
  id: string;
  name: string;
  level: number;
  status: string;
  capabilities: string[];
}

export interface EventEntry {
  id: string;
  type: string;
  sourceAgent: string;
  targetAgent?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface ApprovalEntry {
  id: string;
  overrideLevel: string;
  title: string;
  description: string;
  requestingAgent: string;
  status: string;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
}

export interface TokenUsageResponse {
  total: number;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  dailyAverage: number;
}

export interface UserEntry {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
  isActive: boolean;
  dailyApiCalls: number;
  dailyApiLimit: number;
  createdAt: string;
  lastLoginAt: string | null;
  apiKey?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  byRole: Record<string, number>;
  byTier: Record<string, number>;
}

export interface BillingStats {
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  totalRequests: number;
  byModel: Record<string, { requests: number; cost: number; billed: number }>;
}

export interface WalletInfo {
  userId: string;
  balance: number;
  totalDeposited: number;
  totalSpent: number;
}

export interface TransactionEntry {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balance: number;
  reference: string;
  createdAt: string;
}

export interface NotificationEntry {
  id: string;
  userId: string;
  channel: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CampaignEntry {
  id: string;
  userId: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  spent: number;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  effect: string;
  value: number;
  maxRedemptions: number;
  currentRedemptions: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

// ── API Methods ──

export const api = {
  // Public
  getHealth: () => fetchPublic<HealthResponse>('/health'),
  getInfraHealth: () => fetchPublic<Record<string, unknown>>('/infra/health'),
  getAvatarPipelineHealth: () => fetchPublic<Record<string, unknown>>('/avatar/pipeline/health'),

  // Agents
  getAgents: () => fetchAPI<AgentEntry[]>('/agents'),
  executeAgent: (id: string, task: string) => postAPI<Record<string, unknown>>(`/agents/${id}/execute`, { task }),
  pauseAgent: (id: string) => postAPI<Record<string, unknown>>(`/agents/${id}/pause`, {}),
  resumeAgent: (id: string) => postAPI<Record<string, unknown>>(`/agents/${id}/resume`, {}),
  getAgentHealth: (id: string) => fetchAPI<Record<string, unknown>>(`/agents/${id}/health`),
  getAgentHistory: (id: string, count = 20) => fetchAPI<EventEntry[]>(`/agents/${id}/history?count=${count}`),

  // Events
  getEvents: (count = 50) => fetchAPI<EventEntry[]>(`/events/recent?count=${count}`),
  getEventStats: () => fetchAPI<Record<string, unknown>>('/events/stats'),

  // Approvals
  getApprovals: () => fetchAPI<ApprovalEntry[]>('/approvals/pending'),
  decideApproval: (id: string, decision: 'APPROVED' | 'DENIED', reason?: string) =>
    postAPI<Record<string, unknown>>(`/approvals/${id}/decide`, { decision, reason }),

  // Tokens & State
  getTokenUsage: () => fetchAPI<TokenUsageResponse>('/tokens/usage'),
  getState: () => fetchAPI<Record<string, unknown>>('/state'),
  getRoadmapTasks: () => fetchAPI<Record<string, unknown>>('/roadmap/tasks'),

  // Avatar
  getAvatarMetrics: () => fetchAPI<Record<string, unknown>>('/avatar/pipeline/metrics'),
  getAvatarPersonas: () => fetchAPI<Record<string, unknown>[]>('/avatar/personas'),
  getAvatarConversations: () => fetchAPI<Record<string, unknown>[]>('/avatar/conversations/active'),
  getAvatarCalls: () => fetchAPI<Record<string, unknown>[]>('/avatar/telephony/calls'),

  // Autonomy
  getAutonomyReport: () => fetchAPI<Record<string, unknown>>('/autonomy/report'),
  getAutonomyScore: () => fetchAPI<Record<string, unknown>>('/autonomy/score'),

  // Admin - Users
  getAdminStats: () => fetchAPI<AdminStats>('/admin/stats'),
  getUsers: async (search?: string): Promise<UserEntry[]> => {
    const data = await fetchAPI<{ users: UserEntry[] }>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    return data.users;
  },
  getUser: (id: string) => fetchAPI<UserEntry>(`/admin/users/${id}`),
  createUser: (data: { email: string; displayName: string; role?: string; tier?: string }) =>
    postAPI<UserEntry>('/admin/users', data),
  updateUser: (id: string, data: Partial<UserEntry>) =>
    patchAPI<UserEntry>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => deleteAPI<{ success: boolean }>(`/admin/users/${id}`),
  resetUserKey: (id: string) => postAPI<{ apiKey: string }>(`/admin/users/${id}/reset-key`, {}),

  // Admin - Promo
  getPromoCodes: () => fetchAPI<PromoCode[]>('/admin/promo-codes'),
  createPromoCode: (data: { code: string; effect: string; value: number; maxRedemptions?: number; expiresAt?: string }) =>
    postAPI<PromoCode>('/admin/promo-codes', data),
  deletePromoCode: (code: string) => deleteAPI<{ success: boolean }>(`/admin/promo-codes/${code}`),

  // Billing
  getBillingStats: async (): Promise<BillingStats> => {
    const raw = await fetchAPI<Record<string, unknown>>('/billing/admin/stats');
    const stats = (raw?.['stats'] as Record<string, unknown> | undefined) ?? raw;
    return stats as unknown as BillingStats;
  },
  getPricing: () => fetchAPI<Record<string, unknown>>('/billing/pricing'),
  getUserWallet: (userId: string) => fetchAPI<WalletInfo>(`/billing/wallet?userId=${userId}`),
  depositCredits: (userId: string, amount: number) =>
    postAPI<Record<string, unknown>>('/billing/deposit', { userId, amount }),
  getTransactions: (limit = 50, offset = 0) =>
    fetchAPI<TransactionEntry[]>(`/billing/transactions?limit=${limit}&offset=${offset}`),
  getUsage: () => fetchAPI<Record<string, unknown>>('/billing/usage'),

  // Financial
  getFinancialSummary: () => fetchAPI<Record<string, unknown>>('/financial/summary'),
  getFinancialCosts: () => fetchAPI<Record<string, unknown>>('/financial/costs'),
  getFinancialCharity: () => fetchAPI<Record<string, unknown>>('/financial/charity'),

  // Campaigns
  getCampaigns: () => fetchAPI<CampaignEntry[]>('/campaigns'),
  getCampaign: (id: string) => fetchAPI<CampaignEntry>(`/campaigns/${id}`),

  // Notifications
  getNotifications: () => fetchAPI<NotificationEntry[]>('/notifications'),
  getUnreadCount: () => fetchAPI<{ count: number }>('/notifications/unread-count'),
  sendNotification: (data: { userId: string; channel: string; type: string; title: string; message: string }) =>
    postAPI<Record<string, unknown>>('/notifications/send', data),

  // Memory
  searchMemory: (query: string) => postAPI<Record<string, unknown>[]>('/memory/search', { query }),

  // Tasks
  getTasks: () => fetchAPI<Record<string, unknown>[]>('/tasks'),
  createTask: (data: { name: string; priority?: string; description?: string }) =>
    postAPI<Record<string, unknown>>('/tasks', data),

  // Scheduler & Improvement
  getSchedulerTasks: () => fetchAPI<Record<string, unknown>[]>('/scheduler/tasks'),
  getImprovementHistory: () => fetchAPI<Record<string, unknown>[]>('/improvement/history'),

  // Enterprise Quotes
  getEnterpriseQuotes: (status?: string) =>
    fetchAPI<{ quotes: Record<string, unknown>[]; total: number }>(`/enterprise/quotes${status ? `?status=${status}` : ''}`),
  updateEnterpriseQuote: (id: string, data: { status?: string; adminNotes?: string }) =>
    patchAPI<Record<string, unknown>>(`/enterprise/quotes/${id}`, data),

  // Custom Creation Quotes
  getCustomCreationQuotes: (status?: string) =>
    fetchAPI<{ quotes: Record<string, unknown>[]; total: number }>(`/custom-creation/quotes${status ? `?status=${status}` : ''}`),
  updateCustomCreationQuote: (id: string, data: { status?: string; adminNotes?: string; quotedPrice?: number }) =>
    patchAPI<Record<string, unknown>>(`/custom-creation/quotes/${id}`, data),

  // Analytics — timelines
  getRevenueTimeline: (period = '30d') =>
    fetchAPI<Array<{ date: string; revenue: number; cost: number; margin: number }>>(`/analytics/revenue-trend?period=${period}`),
  getUserGrowth: (period = '30d') =>
    fetchAPI<Array<{ date: string; newUsers: number }>>(`/analytics/user-growth?period=${period}`),
  getTopClients: (limit = 10) =>
    fetchAPI<Array<{ id: string; email: string; displayName: string; tier: string; totalDeposited: number; totalSpent: number; balance: number }>>(`/analytics/top-clients?limit=${limit}`),

  // Referrals
  getReferrals: () => fetchAPI<{ referrals: Array<Record<string, unknown>>; stats: { total: number; active: number } }>('/admin/referrals?limit=200'),
  getTierDistribution: () => fetchAPI<Array<{ tier: string; count: number }>>('/admin/stats/tiers'),
  getAdminTransactions: (limit = 50) => fetchAPI<{ transactions: Array<Record<string, unknown>>; total: number }>(`/admin/transactions?limit=${limit}`),

  // Pilotage — Admin management of client features
  getAdminProjects: () => fetchAPI<{ projects: Array<Record<string, unknown>>; stats: { total: number; active: number; usersCount: number } }>('/admin/projects'),
  getAdminModules: () => fetchAPI<{ modules: Array<Record<string, unknown>>; stats: { total: number; published: number; publicCount: number; totalRecords: number }; byType: Array<{ type: string; count: number }> }>('/admin/modules'),
  getAdminCampaigns: () => fetchAPI<{ campaigns: Array<Record<string, unknown>>; stats: { total: number; drafts: number; pending: number; approved: number; active: number; completed: number } }>('/admin/campaigns'),
  updateCampaignStatus: (id: string, status: string) => patchAPI<{ success: boolean }>(`/admin/campaigns/${id}/status`, { status }),
  getAdminAlarms: () => fetchAPI<{ alarms: Array<Record<string, unknown>>; stats: { total: number; active: number; usersCount: number }; byMode: Array<{ mode: string; count: number }>; byDelivery: Array<{ delivery_method: string; count: number }> }>('/admin/alarms'),
  getAdminCustomAgents: () => fetchAPI<{ agents: Array<Record<string, unknown>>; stats: { total: number; active: number; usersCount: number; avgAutonomy: number } }>('/admin/custom-agents'),
  toggleCustomAgent: (id: string, isActive: boolean) => patchAPI<{ success: boolean }>(`/admin/custom-agents/${id}`, { isActive }),
  getAdminPersonalAgentsStats: () => fetchAPI<{ configs: Array<{ agent_id: string; total: number; active: number }>; budget: { transactions: number; users: number; income: number; expenses: number }; comptable: { records: number; users: number }; chasseur: Array<{ status: string; count: number }>; cv: { total: number }; events: { total: number; users: number }; writing: { projects: number; users: number; words: number } }>('/admin/personal-agents/stats'),
  getAdminDocuments: () => fetchAPI<{ documents: Array<Record<string, unknown>>; stats: { total: number; usersCount: number; totalBytes: number; totalTokens: number }; byType: Array<{ file_type: string; count: number }>; byContext: Array<{ agent_context: string; count: number }> }>('/admin/documents'),
  deleteAdminDocument: (id: string) => deleteAPI<{ success: boolean }>(`/admin/documents/${id}`),

  // Autopilot — Admin governance
  getAutopilotProposals: (params?: { status?: string; category?: string; severity?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.severity) qs.set('severity', params.severity);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return fetchAPI<{ proposals: Array<Record<string, unknown>>; total: number }>(`/autopilot/proposals${q ? `?${q}` : ''}`);
  },
  getAutopilotProposal: (id: string) => fetchAPI<Record<string, unknown>>(`/autopilot/proposals/${id}`),
  decideAutopilotProposal: (id: string, decision: 'approved' | 'denied', notes?: string) =>
    postAPI<Record<string, unknown>>(`/autopilot/proposals/${id}/decide`, { decision, notes }),
  rollbackAutopilotProposal: (id: string) =>
    postAPI<Record<string, unknown>>(`/autopilot/proposals/${id}/rollback`, {}),
  getAutopilotReports: (limit = 10) =>
    fetchAPI<{ reports: Array<Record<string, unknown>> }>(`/autopilot/reports?limit=${limit}`),
  triggerAutopilotAudit: (type: string) =>
    postAPI<{ reportId: string }>('/autopilot/audit/trigger', { type }),
  getAutopilotStats: () => fetchAPI<Record<string, unknown>>('/autopilot/stats'),

  // Generic GET helper for server components
  get: <T>(path: string) => fetchAPI<T>(path),
};
