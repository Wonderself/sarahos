import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import type { ApprovalRequest, ApprovalDecision, OverrideLevel, ApprovalStatus } from './override.types';

export class ApprovalQueue {
  private queue = new Map<string, ApprovalRequest>();

  create(
    overrideLevel: OverrideLevel,
    title: string,
    description: string,
    requestingAgent: string,
    payload: Record<string, unknown> = {},
    expiresInMs?: number
  ): ApprovalRequest {
    const id = uuidv4();
    const now = new Date();

    const request: ApprovalRequest = {
      id,
      overrideLevel,
      title,
      description,
      requestingAgent,
      payload,
      status: 'PENDING',
      expiresAt: expiresInMs ? new Date(now.getTime() + expiresInMs).toISOString() : null,
      createdAt: now.toISOString(),
      decidedAt: null,
      decidedBy: null,
      decisionNotes: null,
    };

    this.queue.set(id, request);

    logger.info('Approval request created', {
      id,
      level: overrideLevel,
      title,
      agent: requestingAgent,
    });

    return request;
  }

  decide(decision: ApprovalDecision): ApprovalRequest {
    const request = this.queue.get(decision.requestId);
    if (!request) {
      throw new Error(`Approval request not found: ${decision.requestId}`);
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Request ${decision.requestId} is not pending (status: ${request.status})`);
    }

    request.status = decision.status;
    request.decidedAt = new Date().toISOString();
    request.decidedBy = decision.decidedBy;
    request.decisionNotes = decision.notes ?? null;

    logger.info('Approval decision made', {
      id: decision.requestId,
      status: decision.status,
      decidedBy: decision.decidedBy,
    });

    return request;
  }

  get(requestId: string): ApprovalRequest | undefined {
    return this.queue.get(requestId);
  }

  getPending(): ApprovalRequest[] {
    this.expireOldRequests();
    return Array.from(this.queue.values()).filter((r) => r.status === 'PENDING');
  }

  getByLevel(level: OverrideLevel): ApprovalRequest[] {
    return Array.from(this.queue.values()).filter((r) => r.overrideLevel === level);
  }

  getByStatus(status: ApprovalStatus): ApprovalRequest[] {
    return Array.from(this.queue.values()).filter((r) => r.status === status);
  }

  private expireOldRequests(): void {
    const now = Date.now();
    for (const request of this.queue.values()) {
      if (request.status === 'PENDING' && request.expiresAt && new Date(request.expiresAt).getTime() < now) {
        request.status = 'EXPIRED';
        logger.warn('Approval request expired', { id: request.id, title: request.title });
      }
    }
  }
}

export const approvalQueue = new ApprovalQueue();
