const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';
const DASHBOARD_API_KEY = process.env['DASHBOARD_API_KEY'] ?? 'admin-key-change-me';

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

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  });

  if (response.status === 401) {
    cachedToken = null;
    tokenExpiresAt = 0;
    const newToken = await getAuthToken();
    const retry = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      ...options,
      headers: { Authorization: `Bearer ${newToken}`, ...options?.headers },
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
};
