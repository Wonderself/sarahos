export type OverrideLevel = 'FINANCIAL' | 'INFRASTRUCTURE' | 'STRATEGIC' | 'SECURITY';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';

export interface ApprovalRequest {
  id: string;
  overrideLevel: OverrideLevel;
  title: string;
  description: string;
  requestingAgent: string;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  expiresAt: string | null;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionNotes: string | null;
}

export interface ApprovalDecision {
  requestId: string;
  status: 'APPROVED' | 'DENIED';
  decidedBy: string;
  notes?: string;
}
