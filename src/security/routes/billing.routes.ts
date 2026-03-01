import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import {
  depositSchema,
  walletTransactionsQuerySchema,
  usageSummaryQuerySchema,
  llmProxyRequestSchema,
} from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

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
   * POST /billing/deposit — Deposit credits (admin or self)
   */
  router.post('/billing/deposit', verifyToken, validateBody(depositSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { userId, amount, description, referenceType, referenceId } = req.body;

    // Non-admins can only deposit to their own wallet
    const callerUserId = authReq.user?.userId ?? authReq.user?.sub;
    if (authReq.user?.role !== 'admin' && userId !== callerUserId) {
      res.status(403).json({ error: 'Cannot deposit to another user\'s wallet' });
      return;
    }

    const { walletService } = await import('../../billing/wallet.service');
    const tx = await walletService.deposit({ userId, amount, description, referenceType, referenceId });
    if (!tx) { res.status(500).json({ error: 'Deposit failed' }); return; }
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
    const result = await llmProxyService.processRequest({
      userId,
      model: req.body.model,
      messages: req.body.messages,
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

    const proxyRequest = {
      userId,
      model: req.body.model,
      messages: req.body.messages,
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
