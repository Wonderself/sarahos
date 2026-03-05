// ── Proposal lifecycle ──
export type ProposalStatus =
  | 'draft' | 'pending_review' | 'approved' | 'denied'
  | 'executing' | 'completed' | 'failed' | 'rolled_back' | 'expired';

export type ProposalSeverity = 'info' | 'warning' | 'critical' | 'urgent';

export type ProposalCategory =
  | 'health' | 'performance' | 'security' | 'business'
  | 'user_experience' | 'cost_optimization';

// ── Supported action types (what agents can do after admin approval) ──
export type ActionType =
  | 'toggle_feature_flag'
  | 'update_agent_config'
  | 'toggle_cron'
  | 'approve_campaign'
  | 'toggle_custom_agent'
  | 'soft_delete_document'
  | 'send_notification'
  | 'update_user_tier'
  | 'create_promo_code'
  | 'trigger_cron'
  | 'modify_billing_param';

export const VALID_ACTION_TYPES: ActionType[] = [
  'toggle_feature_flag', 'update_agent_config', 'toggle_cron',
  'approve_campaign', 'toggle_custom_agent', 'soft_delete_document',
  'send_notification', 'update_user_tier', 'create_promo_code',
  'trigger_cron', 'modify_billing_param',
];

export interface AgentProposal {
  id: string;
  agentId: string;
  agentName: string;
  category: ProposalCategory;
  severity: ProposalSeverity;
  title: string;
  description: string;
  rationale: string;
  impactEstimate?: string;
  riskEstimate?: string;
  actionType: ActionType;
  actionParams: Record<string, unknown>;
  rollbackSnapshot?: Record<string, unknown>;
  status: ProposalStatus;
  waMessageId?: string;
  waSentAt?: Date;
  decidedBy?: string;
  decidedAt?: Date;
  decisionNotes?: string;
  executedBy?: string;
  executedAt?: Date;
  executionLog?: string;
  executionError?: string;
  auditReportId?: string;
  proposalDay: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  severity: ProposalSeverity;
  category: ProposalCategory;
  title: string;
  description: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  proposalSuggested?: boolean;
}

export interface AuditReport {
  id: string;
  auditorId: string;
  reportType: 'health' | 'security' | 'business' | 'performance' | 'combined';
  summary: string;
  findings: AuditFinding[];
  metrics: Record<string, number | string>;
  proposalsGenerated: number;
  waMessageId?: string;
  waSentAt?: Date;
  periodStart?: Date;
  periodEnd?: Date;
  durationMs?: number;
  createdAt: Date;
}

export interface CreateProposalInput {
  agentId: string;
  agentName: string;
  category: ProposalCategory;
  severity: ProposalSeverity;
  title: string;
  description: string;
  rationale: string;
  impactEstimate?: string;
  riskEstimate?: string;
  actionType: ActionType;
  actionParams: Record<string, unknown>;
  auditReportId?: string;
}

export interface AutopilotStats {
  pendingCount: number;
  approvedToday: number;
  deniedToday: number;
  executedToday: number;
  failedToday: number;
  rolledBackTotal: number;
  proposalsByCategory: Record<string, number>;
  proposalsBySeverity: Record<string, number>;
  avgDecisionTimeMinutes: number;
}
