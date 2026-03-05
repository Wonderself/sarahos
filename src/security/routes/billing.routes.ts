import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import {
  depositSchema,
  walletTransactionsQuerySchema,
  usageSummaryQuerySchema,
  llmProxyRequestSchema,
  autoTopupSchema,
} from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';
import { auditLog } from '../../utils/audit-logger';
import { documentRepository } from '../../users/document.repository';
import { MAX_CONTEXT_TOKENS } from '../../utils/text-extractor';

// Map agent names to document contexts
function agentToDocContext(agentName?: string): string {
  if (!agentName) return 'general';
  if (agentName.includes('repondeur')) return 'repondeur';
  if (agentName.includes('personal') || agentName.startsWith('agent-')) return 'personal';
  if (agentName.includes('studio-video') || agentName === 'lucas') return 'studio-video';
  if (agentName.includes('studio-photo') || agentName === 'emma') return 'studio-photo';
  return 'general';
}

async function injectDocumentContext(
  messages: Array<{ role: string; content: string }>,
  userId: string,
  agentName?: string,
): Promise<Array<{ role: string; content: string }>> {
  try {
    const context = agentToDocContext(agentName);
    const docText = await documentRepository.getTextForContext(userId, context, MAX_CONTEXT_TOKENS);
    if (!docText) return messages;

    // Inject into first system message, or prepend a new one
    const systemIdx = messages.findIndex(m => m.role === 'system');
    if (systemIdx >= 0) {
      const updated = [...messages];
      const existing = updated[systemIdx]!;
      updated[systemIdx] = {
        role: existing.role,
        content: existing.content + `\n\n[Documents de reference]\n${docText}`,
      };
      return updated;
    }

    return [
      { role: 'system', content: `[Documents de reference]\n${docText}` },
      ...messages,
    ];
  } catch {
    return messages;
  }
}

export function createBillingRouter(): Router {
  const router = Router();

  // ── User Wallet Endpoints ──

  /**
   * GET /billing/wallet — Get current user's wallet
   */
  router.get('/billing/wallet', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { walletService } = await import('../../billing/wallet.service');
    const wallet = await walletService.getOrCreateWallet(userId);
    res.json({ wallet });
  }));

  /**
   * POST /billing/deposit — Deposit credits (admin or operator only)
   */
  router.post('/billing/deposit', verifyToken, requireRole('admin', 'operator'), validateBody(depositSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { userId, amount, description, referenceType, referenceId, idempotencyKey } = req.body;

    const callerUserId = authReq.user?.userId ?? authReq.user?.sub;

    // Idempotency check: prevent duplicate deposits (atomic with advisory lock)
    if (idempotencyKey) {
      const { dbClient } = await import('../../infra');
      if (dbClient.isConnected()) {
        // Use pg_advisory_xact_lock to serialize checks for the same key
        const keyHash = Math.abs(idempotencyKey.split('').reduce((a: number, c: string) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0));
        const existing = await dbClient.withTransaction(async (client) => {
          await client.query(`SELECT pg_advisory_xact_lock($1)`, [keyHash]);
          return client.query(
            `SELECT id FROM wallet_transactions WHERE description LIKE $1`,
            [`%[idempotency:${idempotencyKey}]%`],
          );
        });
        if (existing.rows.length > 0) {
          res.status(200).json({ message: 'Deposit already processed', duplicate: true });
          return;
        }
      }
    }

    const descWithKey = idempotencyKey ? `${description} [idempotency:${idempotencyKey}]` : description;
    const { walletService } = await import('../../billing/wallet.service');
    const tx = await walletService.deposit({ userId, amount, description: descWithKey, referenceType, referenceId });
    if (!tx) { res.status(500).json({ error: 'Deposit failed' }); return; }
    auditLog({ actor: callerUserId ?? 'unknown', action: 'deposit', resourceType: 'wallet', resourceId: userId, details: { amount, description }, ip: authReq.ip });
    res.status(201).json({ transaction: tx });
  }));

  /**
   * GET /billing/transactions — Get user's transaction history
   */
  router.get('/billing/transactions', verifyToken, validateQuery(walletTransactionsQuerySchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const limit = Number(req.query['limit'] ?? 50);
    const offset = Number(req.query['offset'] ?? 0);

    const { walletService } = await import('../../billing/wallet.service');
    const transactions = await walletService.getTransactions(userId, limit, offset);
    res.json({ transactions });
  }));

  /**
   * GET /billing/usage — Get user's LLM usage summary
   */
  router.get('/billing/usage', verifyToken, validateQuery(usageSummaryQuerySchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const startDate = req.query['startDate'] ? new Date(req.query['startDate'] as string) : undefined;
    const endDate = req.query['endDate'] ? new Date(req.query['endDate'] as string) : undefined;

    const { walletService } = await import('../../billing/wallet.service');
    const summary = await walletService.getUsageSummary(userId, startDate, endDate);
    res.json({ usage: summary });
  }));

  /**
   * GET /billing/pricing — Get current token pricing
   */
  router.get('/billing/pricing', verifyToken, asyncHandler(async (_req, res) => {
    const { TOKEN_PRICING, MICRO_CREDITS_PER_CREDIT } = await import('../../billing');
    res.json({
      pricing: TOKEN_PRICING,
      microCreditsPerCredit: MICRO_CREDITS_PER_CREDIT,
      note: 'Prices are in micro-credits per 1M tokens. 1 credit = 1,000,000 micro-credits.',
    });
  }));

  // ── LLM Proxy ──

  /**
   * POST /billing/llm — Proxy an LLM request with billing
   */
  router.post('/billing/llm', verifyToken, validateBody(llmProxyRequestSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { llmProxyService } = await import('../../billing/llm-proxy.service');
    const enrichedMessages = await injectDocumentContext(req.body.messages, userId, req.body.agentName);
    const result = await llmProxyService.processRequest({
      userId,
      model: req.body.model,
      messages: enrichedMessages,
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature,
      agentName: req.body.agentName,
      endpoint: '/billing/llm',
      requestId: authReq.requestId,
    });

    if ('error' in result) {
      const status = result.code === 'INSUFFICIENT_BALANCE' ? 402 : 500;
      res.status(status).json(result);
      return;
    }

    res.json(result);
  }));

  /**
   * POST /billing/llm/stream — Stream an LLM response with SSE + billing
   */
  router.post('/billing/llm/stream', verifyToken, validateBody(llmProxyRequestSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { llmProxyService } = await import('../../billing/llm-proxy.service');

    const enrichedMessages = await injectDocumentContext(req.body.messages, userId, req.body.agentName);
    const proxyRequest = {
      userId,
      model: req.body.model,
      messages: enrichedMessages,
      maxTokens: req.body.maxTokens,
      temperature: req.body.temperature,
      agentName: req.body.agentName,
      endpoint: '/billing/llm/stream',
      requestId: authReq.requestId,
    };

    // Pre-flight checks (before opening SSE stream)
    const preCheck = await llmProxyService.preFlightCheck(proxyRequest);
    if (preCheck) {
      const status = preCheck.code === 'INSUFFICIENT_BALANCE' ? 402 : 429;
      res.status(status).json(preCheck);
      return;
    }

    // Pre-flight passed: open SSE stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await llmProxyService.processStreamRequest(
      proxyRequest,
      (event: string, data: string) => {
        res.write(`event: ${event}\ndata: ${data}\n\n`);
      },
    );

    res.end();
  }));

  // ── Auto-Topup Settings ──

  /**
   * GET /billing/wallet/auto-topup — Get auto-topup settings
   */
  router.get('/billing/wallet/auto-topup', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { walletService } = await import('../../billing/wallet.service');
    const settings = await walletService.getAutoTopupSettings(userId);
    res.json({ settings: settings ?? { autoTopupEnabled: false, autoTopupThreshold: 0, autoTopupAmount: 0 } });
  }));

  /**
   * PATCH /billing/wallet/auto-topup — Update auto-topup settings
   */
  router.patch('/billing/wallet/auto-topup', verifyToken, validateBody(autoTopupSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { walletService } = await import('../../billing/wallet.service');
    const wallet = await walletService.updateAutoTopupSettings(userId, req.body);
    if (!wallet) { res.status(500).json({ error: 'Failed to update settings' }); return; }

    auditLog({ actor: userId, action: 'update_auto_topup', resourceType: 'wallet', resourceId: userId, details: req.body, ip: authReq.ip });
    res.json({ settings: { autoTopupEnabled: wallet.autoTopupEnabled, autoTopupThreshold: wallet.autoTopupThreshold, autoTopupAmount: wallet.autoTopupAmount } });
  }));

  // ── Invoices ──

  /**
   * GET /billing/invoices — List user's invoices (transaction history)
   */
  router.get('/billing/invoices', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { invoiceService } = await import('../../billing/invoice.service');
    const invoices = await invoiceService.listUserInvoices(userId);
    res.json({ invoices });
  }));

  /**
   * GET /billing/invoices/:transactionId/html — Get HTML invoice for a transaction
   */
  router.get('/billing/invoices/:transactionId/html', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { invoiceService } = await import('../../billing/invoice.service');
    const data = await invoiceService.getInvoiceData(String(req.params['transactionId']), userId);
    if (!data) { res.status(404).json({ error: 'Transaction not found' }); return; }

    const html = invoiceService.generateHtmlInvoice(data);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }));

  // ── Admin Billing Stats ──

  /**
   * GET /billing/admin/stats — Platform-wide billing stats (admin only)
   */
  router.get('/billing/admin/stats', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    const { walletService } = await import('../../billing/wallet.service');
    const stats = await walletService.getPlatformStats();
    res.json({ stats });
  }));

  return router;
}
