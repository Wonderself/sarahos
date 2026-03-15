/**
 * Teams System — Public API
 * Organizations, members, credit pools, and agent management
 */
export {
  OrganizationService,
  type Organization,
  type OrganizationMember,
  type OrgRole,
  type OrgPlan,
  type OrgResult,
} from './OrganizationService';

export {
  CreditPoolService,
  type CreditPool,
  type CreditUsageEntry,
  type MemberUsageSummary,
  type AgentUsageSummary,
  type QuotaCheck,
  type LowBalanceAlert,
  type CreditResult,
} from './CreditPoolService';

export {
  TeamAgentService,
  type OrganizationAgent,
  type AgentResult,
} from './TeamAgentService';
