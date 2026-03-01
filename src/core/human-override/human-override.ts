import { logger } from '../../utils/logger';
import { ApprovalRequiredError } from '../../utils/errors';
import { eventBus } from '../event-bus/event-bus';
import { approvalQueue } from './approval-queue';
import type { OverrideLevel, ApprovalRequest, ApprovalDecision } from './override.types';

const THRESHOLDS: Record<OverrideLevel, { autoApproveBelow?: number }> = {
  FINANCIAL: { autoApproveBelow: 100_00 }, // Auto-approve below 100 EUR (in cents)
  INFRASTRUCTURE: {},
  STRATEGIC: {},
  SECURITY: {},
};

export class HumanOverride {
  async requestApproval(
    level: OverrideLevel,
    title: string,
    description: string,
    requestingAgent: string,
    payload: Record<string, unknown> = {}
  ): Promise<ApprovalRequest> {
    // Check for auto-approval
    const threshold = THRESHOLDS[level];
    if (threshold.autoApproveBelow !== undefined && typeof payload['amount_cents'] === 'number') {
      if (payload['amount_cents'] < threshold.autoApproveBelow) {
        logger.info('Auto-approved (below threshold)', { level, title, amount: payload['amount_cents'] });
        const request = approvalQueue.create(level, title, description, requestingAgent, payload);
        approvalQueue.decide({
          requestId: request.id,
          status: 'APPROVED',
          decidedBy: 'system:auto-approve',
          notes: `Auto-approved: amount below ${threshold.autoApproveBelow} cents threshold`,
        });
        return approvalQueue.get(request.id)!;
      }
    }

    const request = approvalQueue.create(level, title, description, requestingAgent, payload);

    await eventBus.publish('ApprovalRequested', requestingAgent, {
      requestId: request.id,
      level,
      title,
      description,
    });

    logger.info('Human approval requested', { requestId: request.id, level, title });

    return request;
  }

  async processDecision(decision: ApprovalDecision): Promise<ApprovalRequest> {
    const request = approvalQueue.decide(decision);

    const eventType = decision.status === 'APPROVED' ? 'ApprovalGranted' : 'ApprovalDenied';

    await eventBus.publish(eventType, decision.decidedBy, {
      requestId: request.id,
      level: request.overrideLevel,
      title: request.title,
    });

    return request;
  }

  requiresApproval(level: OverrideLevel, payload: Record<string, unknown> = {}): boolean {
    const threshold = THRESHOLDS[level];
    if (threshold.autoApproveBelow !== undefined && typeof payload['amount_cents'] === 'number') {
      return payload['amount_cents'] >= threshold.autoApproveBelow;
    }
    return true;
  }

  async ensureApproved(
    level: OverrideLevel,
    title: string,
    description: string,
    requestingAgent: string,
    payload: Record<string, unknown> = {}
  ): Promise<void> {
    if (this.requiresApproval(level, payload)) {
      const request = await this.requestApproval(level, title, description, requestingAgent, payload);
      if (request.status === 'PENDING') {
        throw new ApprovalRequiredError(
          level,
          `Action "${title}" requires human approval (request: ${request.id})`,
          { requestId: request.id }
        );
      }
    }
  }

  getPendingApprovals(): ApprovalRequest[] {
    return approvalQueue.getPending();
  }
}

export const humanOverride = new HumanOverride();
