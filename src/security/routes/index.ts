import type { Express } from 'express';
import { createAuthRouter } from '../auth.routes';
import { createHealthRouter } from './health.routes';
import { createStateRouter } from './state.routes';
import { createApprovalRouter } from './approval.routes';
import { createAgentRouter } from './agent.routes';
import { createFinancialRouter } from './financial.routes';
import { createAvatarRouter } from './avatar.routes';
import { createTokenRouter } from './token.routes';
import { createAutonomyRouter } from './autonomy.routes';
import { createEventsRouter } from './events.routes';
import { createTaskRouter } from './task.routes';
import { createAgentControlRouter } from './agent-control.routes';
import { createMemoryRouter } from './memory.routes';
import { createStreamRouter } from './stream.routes';
import { createAdminRouter } from './admin.routes';
import { createPromoRouter } from './promo.routes';
import { createBillingRouter } from './billing.routes';
import { createCampaignRouter } from './campaign.routes';
import { createNotificationRouter } from './notification.routes';
import { createClientPortalRouter } from './client-portal.routes';
import { createWhatsAppWebhookRouter } from './whatsapp-webhook.routes';
import { createWhatsAppRouter } from './whatsapp.routes';
import { globalErrorHandler } from '../error-handler.middleware';

export function registerAllRoutes(app: Express): void {
  // Public routes (no auth)
  app.use(createAuthRouter());
  app.use(createHealthRouter());
  app.use(createWhatsAppWebhookRouter());

  // Protected routes
  app.use(createStateRouter());
  app.use(createApprovalRouter());
  app.use(createAgentRouter());
  app.use(createAgentControlRouter());
  app.use(createFinancialRouter());
  app.use(createAvatarRouter());
  app.use(createTokenRouter());
  app.use(createAutonomyRouter());
  app.use(createEventsRouter());
  app.use(createTaskRouter());
  app.use(createMemoryRouter());
  app.use(createStreamRouter());
  app.use(createAdminRouter());
  app.use(createPromoRouter());

  // Phase 9: Billing, Campaigns, Notifications, Client Portal
  app.use(createBillingRouter());
  app.use(createCampaignRouter());
  app.use(createNotificationRouter());
  app.use(createClientPortalRouter());

  // Phase 11: WhatsApp + Voice
  app.use(createWhatsAppRouter());

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Global error handler (must be last)
  app.use(globalErrorHandler);
}
