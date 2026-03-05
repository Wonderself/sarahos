import { logger } from '../utils/logger';
import * as autopilotService from './autopilot.service';
import * as repo from './autopilot.repository';

// ── Phone normalization ──

function normalizePhone(phone: string): string {
  return phone.replace(/[\s+\-()]/g, '');
}

function isAdminPhone(from: string): boolean {
  const adminPhone = process.env['ADMIN_WHATSAPP_PHONE'];
  if (!adminPhone) return false;
  return normalizePhone(from) === normalizePhone(adminPhone);
}

// ── Reply helper (lazy import) ──

async function replyText(to: string, text: string): Promise<void> {
  const { whatsAppService } = await import('../whatsapp/whatsapp.service');
  if (!whatsAppService.isConfigured()) return;
  await whatsAppService.sendTextMessage({ to, text });
}

// ── Button handler ──

interface ButtonReply {
  id: string;
  title: string;
}

async function handleButton(from: string, button: ButtonReply): Promise<void> {
  const { id } = button;

  // ap_approve_{shortId}
  if (id.startsWith('ap_approve_')) {
    const shortId = id.replace('ap_approve_', '');
    const proposal = await repo.getProposalByIdPrefix(shortId);
    if (!proposal) {
      await replyText(from, `Proposition ${shortId} introuvable.`);
      return;
    }
    try {
      await autopilotService.processDecision({
        proposalId: proposal.id,
        decision: 'approved',
        decidedBy: `whatsapp:${normalizePhone(from)}`,
      });
    } catch (err) {
      await replyText(from, `Erreur: ${err instanceof Error ? err.message : String(err)}`);
    }
    return;
  }

  // ap_deny_{shortId}
  if (id.startsWith('ap_deny_')) {
    const shortId = id.replace('ap_deny_', '');
    const proposal = await repo.getProposalByIdPrefix(shortId);
    if (!proposal) {
      await replyText(from, `Proposition ${shortId} introuvable.`);
      return;
    }
    try {
      await autopilotService.processDecision({
        proposalId: proposal.id,
        decision: 'denied',
        decidedBy: `whatsapp:${normalizePhone(from)}`,
      });
    } catch (err) {
      await replyText(from, `Erreur: ${err instanceof Error ? err.message : String(err)}`);
    }
    return;
  }

  // ap_info_{shortId}
  if (id.startsWith('ap_info_')) {
    const shortId = id.replace('ap_info_', '');
    const proposal = await repo.getProposalByIdPrefix(shortId);
    if (!proposal) {
      await replyText(from, `Proposition ${shortId} introuvable.`);
      return;
    }
    const details = await autopilotService.getProposalDetails(proposal.id);
    await replyText(from, details);
    return;
  }

  // ap_list_pending
  if (id === 'ap_list_pending') {
    const text = await autopilotService.sendPendingList();
    await replyText(from, text);
    return;
  }

  // ap_audit_ok
  if (id === 'ap_audit_ok') {
    await replyText(from, 'Compris, aucune action prise.');
    return;
  }

  logger.warn('Autopilot WA: unknown button id', { id });
}

// ── Text command handler ──

async function handleTextCommand(from: string, text: string): Promise<void> {
  const parts = text.trim().split(/\s+/);
  const subCommand = parts[1]?.toLowerCase();

  switch (subCommand) {
    case 'list': {
      const listText = await autopilotService.sendPendingList();
      await replyText(from, listText);
      break;
    }

    case 'approve': {
      const prefix = parts[2];
      if (!prefix) {
        await replyText(from, 'Usage: /ap approve {id}');
        return;
      }
      const proposal = await repo.getProposalByIdPrefix(prefix);
      if (!proposal) {
        await replyText(from, `Proposition ${prefix} introuvable.`);
        return;
      }
      try {
        await autopilotService.processDecision({
          proposalId: proposal.id,
          decision: 'approved',
          decidedBy: `whatsapp:${normalizePhone(from)}`,
        });
      } catch (err) {
        await replyText(from, `Erreur: ${err instanceof Error ? err.message : String(err)}`);
      }
      break;
    }

    case 'deny': {
      const prefix = parts[2];
      if (!prefix) {
        await replyText(from, 'Usage: /ap deny {id} {raison}');
        return;
      }
      const reason = parts.slice(3).join(' ') || undefined;
      const proposal = await repo.getProposalByIdPrefix(prefix);
      if (!proposal) {
        await replyText(from, `Proposition ${prefix} introuvable.`);
        return;
      }
      try {
        await autopilotService.processDecision({
          proposalId: proposal.id,
          decision: 'denied',
          decidedBy: `whatsapp:${normalizePhone(from)}`,
          notes: reason,
        });
      } catch (err) {
        await replyText(from, `Erreur: ${err instanceof Error ? err.message : String(err)}`);
      }
      break;
    }

    case 'rollback': {
      const prefix = parts[2];
      if (!prefix) {
        await replyText(from, 'Usage: /ap rollback {id}');
        return;
      }
      const proposal = await repo.getProposalByIdPrefix(prefix);
      if (!proposal) {
        await replyText(from, `Proposition ${prefix} introuvable.`);
        return;
      }
      try {
        await autopilotService.rollbackProposal(proposal.id, `whatsapp:${normalizePhone(from)}`);
        await replyText(from, `Rollback effectue pour ${prefix}.`);
      } catch (err) {
        await replyText(from, `Erreur rollback: ${err instanceof Error ? err.message : String(err)}`);
      }
      break;
    }

    case 'audit': {
      const stats = await repo.getStats();
      const text = [
        `*Autopilot Stats*`,
        `En attente: ${stats.pendingCount}`,
        `Approuves aujourd'hui: ${stats.approvedToday}`,
        `Refuses aujourd'hui: ${stats.deniedToday}`,
        `Executes aujourd'hui: ${stats.executedToday}`,
        `Echecs aujourd'hui: ${stats.failedToday}`,
        `Rollbacks total: ${stats.rolledBackTotal}`,
        `Temps moyen decision: ${stats.avgDecisionTimeMinutes}min`,
      ].join('\n');
      await replyText(from, text);
      break;
    }

    default:
      await replyText(from, 'Commandes: /ap list | /ap approve {id} | /ap deny {id} {raison} | /ap rollback {id} | /ap audit');
  }
}

// ── Main entry point ──

export async function tryHandleAutopilotMessage(message: {
  from: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
  };
}): Promise<boolean> {
  // Only handle messages from the admin phone
  if (!isAdminPhone(message.from)) return false;

  // Interactive button replies
  if (message.type === 'interactive' && message.interactive?.button_reply) {
    try {
      await handleButton(message.from, message.interactive.button_reply);
    } catch (err) {
      logger.error('Autopilot WA button handler error', { error: String(err) });
      await replyText(message.from, `Erreur interne autopilot: ${err instanceof Error ? err.message : String(err)}`).catch(() => {});
    }
    return true;
  }

  // Text commands
  if (message.type === 'text' && message.text?.body) {
    const body = message.text.body.trim();

    // Only intercept /ap commands
    if (!body.startsWith('/ap ') && body !== '/ap') return false;

    try {
      await handleTextCommand(message.from, body);
    } catch (err) {
      logger.error('Autopilot WA text handler error', { error: String(err) });
      await replyText(message.from, `Erreur interne autopilot: ${err instanceof Error ? err.message : String(err)}`).catch(() => {});
    }
    return true;
  }

  // Other message types: not handled by autopilot
  return false;
}
